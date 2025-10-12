
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { validate } = require('../utils/validate');
const { logger } = require('../utils/log');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all contacts (Admin/Teacher only) - for admin panel
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching contacts from database', { error: error.message });
      throw error;
    }

    res.json(data || []);
  } catch (error) {
    logger.error('Error fetching contacts', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Submit contact form with proper validation
router.post('/', async (req, res) => {
  try {
    // Validate input
    const validation = validate('contactForm', req.body);
    if (!validation.isValid) {
      logger.warn('Contact form validation failed', {
        errors: validation.errors
      });
      return res.status(400).json({ error: validation.errors[0] });
    }

    const { name, email, phone, message } = req.body;

    const startTime = Date.now();
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
    
    const duration = Date.now() - startTime;
    logger.database('INSERT', 'contacts', duration, error);

    if (error) throw error;

    logger.info('Contact form submitted successfully', {
      email,
      name
    });

    res.json({ success: true, message: 'Contact form submitted successfully' });
  } catch (error) {
    logger.error('Error submitting contact form', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

module.exports = router;
