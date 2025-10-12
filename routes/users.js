
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { validate } = require('../utils/validate');
const { logger } = require('../utils/log');
const auth = require('../utils/auth');
const protect = auth.sessionMiddleware;
const authorize = auth.roleMiddleware;
const { uploadProfilePhoto, processImage, generateFileName, uploadToSupabase, IMAGE_PROCESSING_OPTIONS } = require('../utils/upload');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY) : null;


// Get user profile (protected)
router.get('/profile', protect, async (req, res) => {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        description,
        profile_photo_url,
        teacher_profiles (
          subject_specialization,
          experience_years,
          education_background,
          achievements
        )
      `)
      .eq('id', req.user.id)
      .single();

    if (userError) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Flatten teacher profile data
    const profile = {
      ...userData,
      subject_specialization: userData.teacher_profiles?.[0]?.subject_specialization || '',
      experience_years: userData.teacher_profiles?.[0]?.experience_years || '',
      education_background: userData.teacher_profiles?.[0]?.education_background || '',
      achievements: userData.teacher_profiles?.[0]?.achievements || ''
    };

    delete profile.teacher_profiles;
    res.json(profile);
  } catch (error) {
    logger.error('Error fetching profile', {
      userId: req.user?.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile (protected) with enhanced file upload
router.put('/profile', protect, uploadProfilePhoto, async (req, res) => {
  try {
    // Validate input
    const validation = validate('profileUpdate', req.body);
    if (!validation.isValid) {
      logger.warn('Profile update validation failed', {
        userId: req.user.id,
        errors: validation.errors
      });
      return res.status(400).json({ error: validation.errors[0] });
    }

    const {
      name,
      phone,
      description,
      subject_specialization,
      experience_years,
      education_background,
      achievements
    } = req.body;

    let profile_photo_url = null;

    // Handle file upload if present
    if (req.file) {
      logger.info('Processing profile photo upload', {
        userId: req.user.id,
        fileName: req.file.originalname,
        fileSize: req.file.size
      });
      
      // Process image for optimization
      const processStartTime = Date.now();
      const processedImage = await processImage(req.file.buffer, IMAGE_PROCESSING_OPTIONS.profilePhotos);
      const processDuration = Date.now() - processStartTime;
      
      logger.file('PROCESS', req.file.originalname, processDuration, 
        processedImage.success ? null : new Error(processedImage.error));
      
      if (!processedImage.success) {
        logger.error('Image processing error', {
          userId: req.user.id,
          error: processedImage.error
        });
        return res.status(400).json({ error: 'Failed to process profile photo' });
      }

      // Generate file name
      const fileName = generateFileName(req.file.originalname, `profile_${req.user.id}_`);
      
      // Upload to Supabase Storage
      const uploadStartTime = Date.now();
      const uploadResult = await uploadToSupabase(
        supabase, 
        'profile-photos', 
        fileName, 
        processedImage.buffer, 
        req.file.mimetype
      );
      const uploadDuration = Date.now() - uploadStartTime;
      
      logger.file('UPLOAD', fileName, uploadDuration, 
        uploadResult.success ? null : new Error(uploadResult.error));

      if (!uploadResult.success) {
        logger.error('Upload error', {
          userId: req.user.id,
          error: uploadResult.error
        });
        return res.status(400).json({ error: 'Failed to upload profile photo' });
      }

      profile_photo_url = uploadResult.url;
      logger.info('Profile photo uploaded successfully', {
        userId: req.user.id,
        url: profile_photo_url
      });
      
      // Clear teachers cache if user is a teacher (so photo appears immediately)
      if (req.user.role === 'teacher') {
        const cache = require('../utils/cache');
        await cache.del('teachers');
        logger.info('Cleared teachers list cache (photo upload)');
      }
    }

    // Update user table
    const updateData = {
      name,
      phone,
      description
    };

    if (profile_photo_url) {
      updateData.profile_photo_url = profile_photo_url;
    }

    logger.info('Updating user profile', {
      userId: req.user.id,
      fields: Object.keys(updateData)
    });
    
    const updateStartTime = Date.now();
    const { error: userError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id);
    
    const updateDuration = Date.now() - updateStartTime;
    logger.database('UPDATE', 'users', updateDuration, userError);

    if (userError) {
      logger.error('User update error', {
        userId: req.user.id,
        error: userError.message
      });
      return res.status(400).json({ error: 'Failed to update profile' });
    }

    // Update teacher profile if user is a teacher
    if (req.user.role === 'teacher') {
      const teacherProfileData = {
        subject_specialization,
        experience_years: experience_years ? parseInt(experience_years) : null,
        education_background,
        achievements
      };

      logger.info('Updating teacher profile', {
        userId: req.user.id
      });
      
      const teacherProfileStartTime = Date.now();
      const { error: profileError } = await supabase
        .from('teacher_profiles')
        .upsert({
          user_id: req.user.id,
          ...teacherProfileData
        });
      
      const teacherProfileDuration = Date.now() - teacherProfileStartTime;
      logger.database('UPSERT', 'teacher_profiles', teacherProfileDuration, profileError);

      if (profileError) {
        logger.error('Teacher profile update error', {
          userId: req.user.id,
          error: profileError.message
        });
        return res.status(400).json({ error: 'Failed to update teacher profile' });
      }
      
      // Clear teachers list cache so updated info appears immediately
      const cache = require('../utils/cache');
      await cache.del('teachers');
      logger.info('Cleared teachers list cache');
    }

    // Clear profile cache
    const cacheKey = `profile_${req.user.id}`;
    if (typeof profileCache !== 'undefined') {
      profileCache.delete(cacheKey);
    }

    logger.info('✅ Profile updated successfully', {
      userId: req.user.id
    });

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    logger.error('Error updating profile', {
      userId: req.user.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change user role (protected)
router.put('/change-role', protect, async (req, res) => {
  try {
    const { role, teacherCode } = req.body;
    let codeData = null;

    logger.info('🔄 Role change request', {
      userId: req.user.id,
      currentRole: req.user.role,
      requestedRole: role
    });

    if (!role || !['student', 'guardian', 'teacher'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Validate teacher code if changing to teacher
    if (role === 'teacher') {
      if (!teacherCode) {
        return res.status(400).json({ error: 'Teacher verification code is required' });
      }

      logger.info('Validating teacher code for role change', { userId: req.user.id });
      
      const { data: code, error: codeError } = await supabase
        .from('teacher_verification_codes')
        .select('*')
        .eq('code', teacherCode)
        .eq('is_active', true)
        .single();

      if (codeError || !code) {
        logger.warn('Invalid teacher code provided', { userId: req.user.id });
        return res.status(400).json({ error: 'Invalid teacher verification code. Please contact the school administration.' });
      }
      
      codeData = code;
      
      // Check if code has usage limit and if it's exceeded
      if (codeData.max_usage && codeData.usage_count >= codeData.max_usage) {
        logger.warn('Teacher code expired', { userId: req.user.id, code: teacherCode });
        return res.status(400).json({ error: 'Teacher verification code has expired. Please contact the school administration for a new code.' });
      }
    }

    // Use admin client if available, otherwise use regular client
    const client = supabaseAdmin || supabase;
    
    // Update user role
    logger.info('Updating user role', { userId: req.user.id, newRole: role });
    
    const { error: updateError } = await client
      .from('users')
      .update({ 
        role,
        is_active: true, // Ensure user remains active
        verification_code_used: role === 'teacher' ? teacherCode : null
      })
      .eq('id', req.user.id);

    if (updateError) {
      logger.error('Role update error', { userId: req.user.id, error: updateError.message });
      return res.status(400).json({ error: 'Failed to update role. Please try again later.' });
    }

    // If changing to teacher, create teacher profile
    if (role === 'teacher') {
      logger.info('Creating teacher profile', { userId: req.user.id });
      
      const { error: profileError } = await client
        .from('teacher_profiles')
        .upsert({
          user_id: req.user.id,
          display_order: 0
        });

      if (profileError) {
        logger.error('Teacher profile creation error', { userId: req.user.id, error: profileError.message });
      }
      
      // Update teacher code usage count
      if (codeData) {
        const { error: codeUpdateError } = await client
          .from('teacher_verification_codes')
          .update({ usage_count: codeData.usage_count + 1 })
          .eq('code', teacherCode);
          
        if (codeUpdateError) {
          logger.error('Error updating teacher code usage', { error: codeUpdateError.message });
        }
      }
      
      // Clear teachers cache so new teacher appears immediately
      const cache = require('../utils/cache');
      await cache.del('teachers');
      logger.info('Cleared teachers list cache (role changed to teacher)');
    } else if (req.user.role === 'teacher') {
      // If changing FROM teacher to another role, also clear cache
      const cache = require('../utils/cache');
      await cache.del('teachers');
      logger.info('Cleared teachers list cache (role changed from teacher)');
    }

    logger.info('✅ Role changed successfully', { 
      userId: req.user.id, 
      newRole: role 
    });

    res.json({ success: true, message: 'Role updated successfully', newRole: role });
  } catch (error) {
    logger.error('Error changing role', { 
      userId: req.user.id, 
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to change role. Please try again later.' });
  }
});

// Delete user account (protected)
router.delete('/delete-account', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    logger.info('🗑️ Starting account deletion', { userId, userEmail });

    // Check if admin client is available
    if (!supabaseAdmin) {
      logger.error('❌ Supabase Admin client not initialized');
      return res.status(500).json({ 
        error: 'Server configuration error. Please contact administrator.', 
        details: 'SUPABASE_SERVICE_ROLE_KEY not configured' 
      });
    }

    // Verify userId is valid
    if (!userId) {
      logger.error('❌ No user ID in token');
      return res.status(400).json({ error: 'Invalid user session. Please login again.' });
    }

    logger.info('📧 Proceeding with account deletion', { userEmail });

    // Delete user data in correct order (respecting foreign key constraints)
    // Using admin client to bypass RLS policies
    
    // 1. Delete teacher profile if exists
    logger.info('🔄 Deleting teacher profile', { userId });
    const { error: profileError } = await supabaseAdmin
      .from('teacher_profiles')
      .delete()
      .eq('user_id', userId);
    
    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is okay
      logger.warn('⚠️  Teacher profile deletion warning', { error: profileError.message });
    } else {
      logger.info('✅ Teacher profile deleted');
    }

    // 2. Delete notices created by user
    logger.info('🔄 Deleting user notices', { userId });
    const { error: noticesError } = await supabaseAdmin
      .from('notices')
      .delete()
      .eq('created_by', userId);
      
    if (noticesError && noticesError.code !== 'PGRST116') {
      logger.warn('⚠️  Notices deletion warning', { error: noticesError.message });
    } else {
      logger.info('✅ User notices deleted');
    }

    // 3. Delete media uploaded by user
    logger.info('🔄 Deleting user media', { userId });
    const { error: mediaError } = await supabaseAdmin
      .from('media')
      .delete()
      .eq('uploaded_by', userId);
      
    if (mediaError && mediaError.code !== 'PGRST116') {
      logger.warn('⚠️  Media deletion warning', { error: mediaError.message });
    } else {
      logger.info('✅ User media deleted');
    }

    // 4. Delete from custom users table
    logger.info('🔄 Deleting from users table', { userId });
    const { error: userDeleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (userDeleteError) {
      logger.error('❌ User table deletion failed', { error: userDeleteError.message });
      // Don't fail here, continue to auth deletion
      logger.warn('⚠️  Continuing despite users table error');
    } else {
      logger.info('✅ User deleted from users table');
    }

    // 5. CRITICAL: Delete from Supabase Auth (auth.users) - this is the main account
    logger.info('🔄 Deleting from Supabase Auth', { userId });
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      logger.error('❌ Supabase Auth deletion failed', { error: authDeleteError.message });
      return res.status(500).json({ 
        error: 'Failed to delete authentication account', 
        details: authDeleteError.message 
      });
    }
    logger.info('✅ User deleted from Supabase Auth');

    logger.info('✅ Account completely deleted', { userId, userEmail });
    res.json({ success: true, message: 'Account permanently deleted successfully' });
  } catch (error) {
    logger.error('❌ Error deleting account', {
      userId: req.user?.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to delete account', details: error.message });
  }
});

module.exports = router;
