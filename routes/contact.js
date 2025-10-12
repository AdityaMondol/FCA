
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { validate } = require('../utils/validate');
const { logger } = require('../utils/log');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
