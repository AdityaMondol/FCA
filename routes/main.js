const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { logger } = require('../utils/log');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Health check endpoint
router.get('/health', (req, res) => {
  logger.info('Health check endpoint called');
  res.json({ 
    status: 'healthy',
    message: 'Farid Cadet Academy Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
router.get('/test', (req, res) => {
  logger.info('Test endpoint called');
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// Test Supabase connection endpoint
router.get('/test/supabase', async (req, res) => {
  try {
    // Test 1: Check if we can query users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count');
    
    // Test 2: Check if we can query notices table
    const { data: notices, error: noticesError } = await supabase
      .from('notices')
      .select('count');
    
    // Test 3: Check if we can query media table
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .select('count');

    res.json({
      success: true,
      supabaseUrl: supabaseUrl.substring(0, 30) + '...',
      tests: {
        usersTable: usersError ? '❌ Error: ' + usersError.message : '✅ Connected',
        noticesTable: noticesError ? '❌ Error: ' + noticesError.message : '✅ Connected',
        mediaTable: mediaError ? '❌ Error: ' + mediaError.message : '✅ Connected'
      },
      note: 'This app uses custom JWT authentication, not Supabase Auth. No verification emails will be sent.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      note: 'Check your SUPABASE_URL and SUPABASE_KEY in .env file'
    });
  }
});

// Get academy information
router.get('/academy-info', (req, res) => {
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

// Test endpoint to check if user still exists (for debugging)
router.get('/check-user/:email', async (req, res) => {
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
    logger.error('Error checking user', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to check user' });
  }
});

module.exports = router;
