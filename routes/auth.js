
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { validate } = require('../utils/validate');
const { logger } = require('../utils/log');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Login (using Supabase Auth) with proper validation
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    logger.info('🔐 Login attempt', { email });

    // Validate input
    const validation = validate('login', req.body);
    if (!validation.isValid) {
      logger.warn('Login validation failed', {
        email,
        errors: validation.errors
      });
      return res.status(400).json({ error: validation.errors[0] });
    }

    // Use Supabase Auth to sign in
    const startTime = Date.now();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    const duration = Date.now() - startTime;
    logger.auth('LOGIN_ATTEMPT', null, email, !authError, authError);

    if (authError) {
      logger.warn('Login failed', {
        email,
        error: authError.message
      });
      // Provide more specific error messages
      if (authError.message.includes('Invalid login credentials')) {
        return res.status(401).json({ error: 'Invalid email or password' });
      } else if (authError.message.includes('Email not confirmed')) {
        return res.status(401).json({ error: 'Please verify your email address before logging in' });
      } else {
        return res.status(401).json({ error: authError.message });
      }
    }

    // Get user profile from public.users table
    const profileStartTime = Date.now();
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    const profileDuration = Date.now() - profileStartTime;
    logger.database('SELECT', 'users', profileDuration, profileError);

    if (profileError) {
      logger.warn('Profile fetch error', {
        email,
        userId: authData.user.id,
        error: profileError.message
      });
    }

    logger.info('✅ Login successful', {
      email,
      userId: authData.user.id,
      userRole: userProfile?.role || 'student'
    });
    
    res.json({
      session: authData.session,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: userProfile?.name || '',
        role: userProfile?.role || 'student',
        phone: userProfile?.phone,
        profile_photo_url: userProfile?.profile_photo_url
      }
    });
  } catch (error) {
    logger.error('Error logging in', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Login failed. Please try again later.' });
  }
});

// Register (using Supabase Auth with email verification) with proper validation
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, phone, teacherCode } = req.body;
    let codeData = null; // Declare at function scope

    // Validate input
    const validation = validate('registration', req.body);
    if (!validation.isValid) {
      logger.warn('Registration validation failed', {
        email,
        errors: validation.errors
      });
      return res.status(400).json({ error: validation.errors[0] });
    }

    // Validate teacher code if role is teacher
    if (role === 'teacher') {
      logger.info('Validating teacher code', { email, role });
      
      const codeStartTime = Date.now();
      const { data: fetchedCodeData, error: codeError } = await supabase
        .from('teacher_verification_codes')
        .select('*')
        .eq('code', teacherCode)
        .eq('is_active', true)
        .single();
      
      codeData = fetchedCodeData; // Assign to function-scoped variable
      
      const codeDuration = Date.now() - codeStartTime;
      logger.database('SELECT', 'teacher_verification_codes', codeDuration, codeError);

      if (codeError || !codeData) {
        logger.warn('Invalid teacher verification code', {
          email,
          teacherCode: teacherCode ? 'provided' : 'missing'
        });
        return res.status(400).json({ error: 'Invalid teacher verification code. Please contact the school administration.' });
      }
      
      // Check if code has usage limit and if it's exceeded
      if (codeData.max_usage && codeData.usage_count >= codeData.max_usage) {
        logger.warn('Teacher verification code expired', {
          email,
          codeId: codeData.id,
          usageCount: codeData.usage_count,
          maxUsage: codeData.max_usage
        });
        return res.status(400).json({ error: 'Teacher verification code has expired. Please contact the school administration for a new code.' });
      }
    }

    // Use Supabase Auth to create user (will send verification email)
    logger.info('Creating user with Supabase Auth', { email, role });
    
    const authStartTime = Date.now();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          phone: phone || null
        },
        emailRedirectTo: FRONTEND_URL
      }
    });
    
    const authDuration = Date.now() - authStartTime;
    logger.auth('REGISTER', authData?.user?.id, email, !authError, authError);

    if (authError) {
      logger.error('Supabase Auth registration failed', {
        email,
        error: authError.message
      });
      // Provide more specific error messages
      if (authError.message.includes('already been registered')) {
        return res.status(400).json({ error: 'This email is already registered. Please use a different email or login.' });
      } else {
        return res.status(400).json({ error: authError.message });
      }
    }

    // Create or update user profile in public.users table (using upsert)
    logger.info('Creating user profile', { 
      email, 
      userId: authData.user.id,
      role 
    });
    
    const profileStartTime = Date.now();
    const { error: profileError } = await supabase
      .from('users')
      .upsert([
        {
          id: authData.user.id,
          email,
          name,
          role,
          phone: phone || null,
          verification_code_used: role === 'teacher' ? teacherCode : null
        }
      ], {
        // Use a single unique column for conflict handling to match the DB constraint
        onConflict: 'email'
      });
    
    const profileDuration = Date.now() - profileStartTime;
    logger.database('UPSERT', 'users', profileDuration, profileError);

    if (profileError) {
      logger.error('Error creating user profile', {
        email,
        userId: authData.user.id,
        error: profileError.message
      });
      // Don't fail registration if profile creation fails
    }

    // If teacher, create teacher profile entry and update code usage
    if (role === 'teacher') {
      logger.info('Creating teacher profile', { 
        email, 
        userId: authData.user.id
      });
      
      const teacherProfileStartTime = Date.now();
      const { error: teacherProfileError } = await supabase
        .from('teacher_profiles')
        .upsert([
          {
            user_id: authData.user.id,
            display_order: 0
          }
        ], {
          onConflict: 'user_id'
        });
      
      const teacherProfileDuration = Date.now() - teacherProfileStartTime;
      logger.database('UPSERT', 'teacher_profiles', teacherProfileDuration, teacherProfileError);

      if (teacherProfileError) {
        logger.error('Error creating teacher profile', {
          email,
          userId: authData.user.id,
          error: teacherProfileError.message
        });
      }
      
      // Update teacher code usage count
      if (codeData) {
        const codeUpdateStartTime = Date.now();
        const { error: codeUpdateError } = await supabase
          .from('teacher_verification_codes')
          .update({ usage_count: codeData.usage_count + 1 })
          .eq('code', teacherCode);
        
        const codeUpdateDuration = Date.now() - codeUpdateStartTime;
        logger.database('UPDATE', 'teacher_verification_codes', codeUpdateDuration, codeUpdateError);
          
        if (codeUpdateError) {
          logger.error('Error updating teacher code usage', {
            email,
            code: teacherCode,
            error: codeUpdateError.message
          });
        }
      }
    }

    logger.info('✅ Registration successful', {
      email,
      userId: authData.user.id,
      role
    });

    res.json({ 
      success: true, 
      message: 'Registration successful! Please check your email to verify your account.',
      emailSent: true
    });
  } catch (error) {
    logger.error('Error registering user', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Registration failed. Please try again later.' });
  }
});

module.exports = router;
