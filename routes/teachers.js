const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { logger } = require('../utils/log');
const cache = require('../utils/cache');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const CACHE_KEY = 'teachers';
const CACHE_TTL = 5 * 60; // 5 minutes

router.get('/', async (req, res) => {
  try {
    // Check cache first
    const cachedTeachers = await cache.get(CACHE_KEY);
    if (cachedTeachers) {
      logger.debug('✅ Returning cached teachers data');
      return res.json(cachedTeachers);
    }
    
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
      logger.error('Error fetching teachers', { error: error.message, stack: error.stack });
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

    // Update cache
    await cache.set(CACHE_KEY, teachers, CACHE_TTL);
    
    res.json(teachers);
  } catch (error) {
    logger.error('Error fetching teachers', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

module.exports = router;