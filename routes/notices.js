
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { validate } = require('../utils/validate');
const { logger } = require('../utils/log');
const auth = require('../utils/auth');
const { 
  cacheMiddleware, 
  rateLimitMiddleware, 
  invalidateCacheMiddleware,
  conditionalCacheMiddleware 
} = require('../middleware/cache');
const { CACHE_TTL, CACHE_TAGS } = require('../utils/cache');
const authenticateToken = auth.sessionMiddleware;
const authorizeRole = auth.roleMiddleware;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all notices with caching and pagination
router.get('/', 
  rateLimitMiddleware({ max: 100, windowMs: 15 * 60 * 1000 }),
  conditionalCacheMiddleware({ 
    publicTTL: CACHE_TTL.NOTICES,
    privateTTL: 300,
    adminTTL: 60,
    keyPrefix: 'notices'
  }),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);
      const offset = (page - 1) * limit;

      // Build query based on user role
      let query = supabase
        .from('notices')
        .select('*', { count: 'exact' })
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);

      // If not authenticated or not teacher, only show published notices
      if (!req.user || req.user.role !== 'teacher') {
        query = query.eq('is_published', true);
      }

      const { data, error, count } = await query;

      if (error) {
        logger.error('Error fetching notices from database', { error: error.message });
        throw error;
      }

      res.json({
        notices: data || [],
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching notices', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Failed to fetch notices' });
    }
  }
);

// Create notice (Teacher only) with validation and cache invalidation
router.post('/', 
  authenticateToken, 
  authorizeRole('teacher', 'admin'),
  rateLimitMiddleware({ max: 20, windowMs: 60 * 60 * 1000 }), // 20 per hour
  invalidateCacheMiddleware([CACHE_TAGS.NOTICES]),
  async (req, res) => {
    try {
      // Enhanced validation
      const validation = validate('noticeCreation', req.body);
      if (!validation.isValid) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: validation.errors 
        });
      }

      const { 
        title_en, 
        title_bn, 
        content_en, 
        content_bn, 
        priority,
        is_published = false,
        scheduled_at,
        expires_at
      } = req.body;

      const noticeData = {
        title_en,
        title_bn,
        content_en,
        content_bn,
        priority: priority || 'medium',
        is_published,
        date: new Date().toISOString(),
        created_by: req.user.id
      };

      // Add optional fields
      if (scheduled_at) noticeData.scheduled_at = scheduled_at;
      if (expires_at) noticeData.expires_at = expires_at;

      const { data, error } = await supabase
        .from('notices')
        .insert([noticeData])
        .select()
        .single();

      if (error) throw error;

      logger.info('Notice created successfully', {
        userId: req.user.id,
        noticeId: data.id,
        title: title_en || title_bn
      });

      res.status(201).json({ 
        success: true, 
        notice: data,
        message: 'Notice created successfully'
      });
    } catch (error) {
      logger.error('Error creating notice', { 
        userId: req.user?.id,
        error: error.message, 
        stack: error.stack 
      });
      res.status(500).json({ error: 'Failed to create notice' });
    }
  }
);

// Update notice (Teacher only)
router.put('/:id',
  authenticateToken,
  authorizeRole('teacher', 'admin'),
  rateLimitMiddleware({ max: 30, windowMs: 60 * 60 * 1000 }),
  invalidateCacheMiddleware([CACHE_TAGS.NOTICES]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Remove fields that shouldn't be updated
      delete updates.id;
      delete updates.created_by;
      delete updates.date;

      const { data, error } = await supabase
        .from('notices')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({ error: 'Notice not found' });
      }

      logger.info('Notice updated successfully', {
        userId: req.user.id,
        noticeId: id
      });

      res.json({ 
        success: true, 
        notice: data,
        message: 'Notice updated successfully' 
      });
    } catch (error) {
      logger.error('Error updating notice', {
        userId: req.user?.id,
        noticeId: req.params.id,
        error: error.message,
        stack: error.stack
      });
      res.status(500).json({ error: 'Failed to update notice' });
    }
  }
);

// Delete notice (Teacher only)
router.delete('/:id', 
  authenticateToken, 
  authorizeRole('teacher', 'admin'),
  rateLimitMiddleware({ max: 10, windowMs: 60 * 60 * 1000 }),
  invalidateCacheMiddleware([CACHE_TAGS.NOTICES]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // First check if notice exists
      const { data: existingNotice } = await supabase
        .from('notices')
        .select('id, title_en, title_bn')
        .eq('id', id)
        .single();

      if (!existingNotice) {
        return res.status(404).json({ error: 'Notice not found' });
      }

      const { error } = await supabase
        .from('notices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      logger.info('Notice deleted successfully', {
        userId: req.user.id,
        noticeId: id,
        title: existingNotice.title_en || existingNotice.title_bn
      });

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
  }
);

// Get single notice by ID
router.get('/:id',
  rateLimitMiddleware({ max: 200, windowMs: 15 * 60 * 1000 }),
  cacheMiddleware(CACHE_TTL.NOTICES),
  async (req, res) => {
    try {
      const { id } = req.params;

      let query = supabase
        .from('notices')
        .select('*')
        .eq('id', id)
        .single();

      // If not authenticated or not teacher, only show published notices
      if (!req.user || req.user.role !== 'teacher') {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Notice not found' });
        }
        throw error;
      }

      res.json(data);
    } catch (error) {
      logger.error('Error fetching notice', {
        noticeId: req.params.id,
        error: error.message,
        stack: error.stack
      });
      res.status(500).json({ error: 'Failed to fetch notice' });
    }
  }
);

module.exports = router;
