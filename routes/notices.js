
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { validate } = require('../utils/validate');
const { logger } = require('../utils/log');
const auth = require('../utils/auth');
const authenticateToken = auth.sessionMiddleware;
const authorizeRole = auth.roleMiddleware;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all notices (requires authentication)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      logger.error('Error fetching notices from database', { error: error.message });
      throw error;
    }

    res.json(data || []);
  } catch (error) {
    logger.error('Error fetching notices', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
});

// Create notice (Teacher only) with validation
router.post('/', authenticateToken, authorizeRole('teacher', 'admin'), async (req, res) => {
  try {
    // Validate input
    const validation = validate('noticeCreation', req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors[0] });
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
    logger.error('Error creating notice', { 
      userId: req.user?.id,
      error: error.message, 
      stack: error.stack 
    });
    res.status(500).json({ error: 'Failed to create notice' });
  }
});

// Delete notice (Teacher only)
router.delete('/:id', authenticateToken, authorizeRole('teacher', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    logger.error('Error deleting notice', { 
      userId: req.user?.id,
      noticeId: req.params.id,
      error: error.message, 
      stack: error.stack 
    });
    res.status(500).json({ error: 'Failed to delete notice' });
  }
});

module.exports = router;
