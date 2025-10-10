const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Add startup logging
console.log('========================================');
console.log('🚀 Farid Cadet Academy Backend Server');
console.log('========================================');
console.log('📅 Started at:', new Date().toLocaleString());
console.log('🌐 Port:', PORT);
console.log('📂 Environment:', process.env.NODE_ENV || 'development');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'your_supabase_url_here';
const supabaseKey = process.env.SUPABASE_KEY || 'your_supabase_key_here';

console.log('🔐 Supabase URL:', supabaseUrl.substring(0, 30) + '...');
console.log('🔑 Supabase Key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

// Test database connection
console.log('🔌 Testing database connection...');
supabase
  .from('users')
  .select('count')
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Database connection failed:', error.message);
    } else {
      console.log('✅ Database connection successful');
    }
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toLocaleTimeString()}`);
  next();
});

// Serve static files from Svelte build
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// JWT middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ============= API ROUTES =============

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    message: 'Farid Cadet Academy Backend is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
});

// Get academy information
app.get('/api/academy-info', (req, res) => {
  res.json({
    name: "Farid Cadet Academy",
    location: "Walton More, Mymensingh road, Tangail Sadar, Tangail",
    objective: "To prepare students for competitive entrance examinations into cadet colleges in Bangladesh",
    targetLevel: "Students from Class 4 to Class 6",
    academicOfferings: [
      "Bengali (Bangla)",
      "English",
      "Mathematics",
      "General Knowledge"
    ],
    classSchedule: [
      "Day Coaching",
      "Night Coaching",
      "Residential"
    ],
    operationalHistory: "The academy has been active since at least 2022",
    notableAchievement: {
      year: 2023,
      candidatesPrepared: 18,
      applicants: 16
    },
    faculty: "Qualified educators",
    admissionStatus: "Admissions are ongoing",
    contactInfo: [
      "01715-000090",
      "01928-268993",
      "01674-455000"
    ],
    branding: "Bold visual branding with dominant use of red and yellow colors"
  });
});

// Get all notices
app.get('/api/notices', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
});

// Get all media items
app.get('/api/media', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// Submit contact form
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert([
        {
          name,
          email,
          phone: phone || null,
          message,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;

    res.json({ success: true, message: 'Contact form submitted successfully' });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

// ============= AUTHENTICATION ROUTES =============

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !users) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, users.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: users.id, email: users.email, role: users.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register (public endpoint with role-based validation)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role, phone, teacherCode } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    // Validate teacher code if role is teacher
    if (role === 'teacher') {
      if (!teacherCode) {
        return res.status(400).json({ error: 'Teacher verification code is required' });
      }

      // Check if teacher code is valid
      const { data: codeData, error: codeError } = await supabase
        .from('teacher_verification_codes')
        .select('*')
        .eq('code', teacherCode)
        .eq('is_active', true)
        .single();

      if (codeError || !codeData) {
        return res.status(400).json({ error: 'Invalid teacher verification code' });
      }
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          name,
          role,
          phone: phone || null,
          verification_code_used: role === 'teacher' ? teacherCode : null
        }
      ])
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(400).json({ error: error.message });
    }

    // If teacher, create teacher profile entry
    if (role === 'teacher' && data && data[0]) {
      const { error: profileError } = await supabase
        .from('teacher_profiles')
        .insert([
          {
            user_id: data[0].id,
            display_order: 0
          }
        ]);

      if (profileError) {
        console.error('Error creating teacher profile:', profileError);
      }
    }

    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get teachers for public display
app.get('/api/teachers', async (req, res) => {
  try {
    const { data, error } = await supabase
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
          achievements,
          display_order
        )
      `)
      .eq('role', 'teacher')
      .eq('is_active', true)
      .order('teacher_profiles.display_order', { ascending: true });

    if (error) {
      console.error('Error fetching teachers:', error);
      return res.status(500).json({ error: 'Failed to fetch teachers' });
    }

    // Transform data to flatten teacher profiles
    const teachers = data.map(teacher => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      description: teacher.description,
      profile_photo_url: teacher.profile_photo_url,
      subject_specialization: teacher.teacher_profiles?.[0]?.subject_specialization,
      experience_years: teacher.teacher_profiles?.[0]?.experience_years,
      education_background: teacher.teacher_profiles?.[0]?.education_background,
      achievements: teacher.teacher_profiles?.[0]?.achievements
    }));

    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// Get user profile (protected)
app.get('/api/profile', authenticateToken, async (req, res) => {
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
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile (protected)
app.put('/api/profile', authenticateToken, upload.single('profile_photo'), async (req, res) => {
  try {
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
      const fileName = `profile_${req.user.id}_${Date.now()}.${req.file.originalname.split('.').pop()}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return res.status(400).json({ error: 'Failed to upload photo' });
      }

      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      profile_photo_url = urlData.publicUrl;
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

    const { error: userError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id);

    if (userError) {
      console.error('User update error:', userError);
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

      const { error: profileError } = await supabase
        .from('teacher_profiles')
        .upsert({
          user_id: req.user.id,
          ...teacherProfileData
        });

      if (profileError) {
        console.error('Teacher profile update error:', profileError);
        return res.status(400).json({ error: 'Failed to update teacher profile' });
      }
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change user role (protected)
app.put('/api/change-role', authenticateToken, async (req, res) => {
  try {
    const { role, teacherCode } = req.body;

    if (!role || !['student', 'guardian', 'teacher'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Validate teacher code if changing to teacher
    if (role === 'teacher') {
      if (!teacherCode) {
        return res.status(400).json({ error: 'Teacher verification code is required' });
      }

      const { data: codeData, error: codeError } = await supabase
        .from('teacher_verification_codes')
        .select('*')
        .eq('code', teacherCode)
        .eq('is_active', true)
        .single();

      if (codeError || !codeData) {
        return res.status(400).json({ error: 'Invalid teacher verification code' });
      }
    }

    // Update user role
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        role,
        verification_code_used: role === 'teacher' ? teacherCode : null
      })
      .eq('id', req.user.id);

    if (updateError) {
      console.error('Role update error:', updateError);
      return res.status(400).json({ error: 'Failed to update role' });
    }

    // If changing to teacher, create teacher profile
    if (role === 'teacher') {
      const { error: profileError } = await supabase
        .from('teacher_profiles')
        .upsert({
          user_id: req.user.id,
          display_order: 0
        });

      if (profileError) {
        console.error('Teacher profile creation error:', profileError);
      }
    }

    res.json({ success: true, message: 'Role updated successfully' });
  } catch (error) {
    console.error('Error changing role:', error);
    res.status(500).json({ error: 'Failed to change role' });
  }
});

// Delete user account (protected)
app.delete('/api/delete-account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`🗑️ Starting account deletion for user ID: ${userId}`);

    // First, verify the user exists
    const { data: userExists, error: userCheckError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', userId)
      .single();

    if (userCheckError || !userExists) {
      console.error('User not found for deletion:', userCheckError);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`📧 Deleting account for: ${userExists.email} (${userExists.name})`);

    // Delete user data in correct order (respecting foreign key constraints)
    
    // 1. Delete teacher profile if exists
    console.log('🔄 Deleting teacher profile...');
    const { error: profileError } = await supabase
      .from('teacher_profiles')
      .delete()
      .eq('user_id', userId);
    
    if (profileError) {
      console.error('Teacher profile deletion error:', profileError);
    } else {
      console.log('✅ Teacher profile deleted (if existed)');
    }

    // 2. Delete notices created by user
    console.log('🔄 Deleting user notices...');
    const { error: noticesError } = await supabase
      .from('notices')
      .delete()
      .eq('created_by', userId);
      
    if (noticesError) {
      console.error('Notices deletion error:', noticesError);
    } else {
      console.log('✅ User notices deleted');
    }

    // 3. Delete media uploaded by user
    console.log('🔄 Deleting user media...');
    const { error: mediaError } = await supabase
      .from('media')
      .delete()
      .eq('uploaded_by', userId);
      
    if (mediaError) {
      console.error('Media deletion error:', mediaError);
    } else {
      console.log('✅ User media deleted');
    }

    // 4. Finally delete the user
    console.log('🔄 Deleting user account...');
    const { data: deletedUser, error: userDeleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)
      .select();

    if (userDeleteError) {
      console.error('❌ User deletion failed:', userDeleteError);
      return res.status(500).json({ 
        error: 'Failed to delete user account', 
        details: userDeleteError.message 
      });
    }

    if (!deletedUser || deletedUser.length === 0) {
      console.error('❌ User deletion returned no data - user may not have been deleted');
      return res.status(500).json({ error: 'Account deletion failed - user still exists' });
    }

    console.log('✅ User account successfully deleted:', deletedUser[0]);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account', details: error.message });
  }
});

// Test endpoint to check if user still exists (for debugging)
app.get('/api/check-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, created_at')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.json({ exists: false, message: 'User not found' });
    }

    res.json({ 
      exists: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Error checking user:', error);
    res.status(500).json({ error: 'Failed to check user' });
  }
});

// ============= PROTECTED ROUTES (Teacher only) =============

// Create notice
app.post('/api/notices', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Teacher access required' });
    }

    const { title_en, title_bn, content_en, content_bn, priority } = req.body;

    const { data, error } = await supabase
      .from('notices')
      .insert([
        {
          title_en,
          title_bn,
          content_en,
          content_bn,
          priority: priority || 'medium',
          date: new Date().toISOString(),
          created_by: req.user.id
        }
      ]);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ error: 'Failed to create notice' });
  }
});

// Upload media
app.post('/api/media', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    // Save metadata to database
    const { data, error } = await supabase
      .from('media')
      .insert([
        {
          title,
          description,
          url: publicUrl,
          type: file.mimetype.startsWith('image/') ? 'image' : 'video',
          date: new Date().toISOString(),
          uploaded_by: req.user.id
        }
      ]);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

// Delete notice
app.delete('/api/notices/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ error: 'Failed to delete notice' });
  }
});

// Delete media
app.delete('/api/media/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// Get all contact submissions (Admin only)
app.get('/api/contacts', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// ============= SERVE FRONTEND =============

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║       Farid Cadet Academy - Server Running                ║
║                                                           ║
║       🌐 Server: http://localhost:${PORT}                    ║
║       📚 Academy: Farid Cadet Academy                     ║
║       📍 Location: Tangail, Bangladesh                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});