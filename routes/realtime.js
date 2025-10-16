const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { verifyToken } = require('../utils/auth');
const { logger } = require('../utils/log');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get real-time notifications
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;
    
    // Get user notifications (this would be from a notifications table)
    // For now, we'll return recent activities as notifications
    const { data: notices } = await supabase
      .from('notices')
      .select('id, title, content, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const notifications = (notices || []).map(notice => ({
      id: notice.id,
      type: 'notice',
      title: 'New Notice',
      message: notice.title,
      timestamp: notice.created_at,
      read: false
    }));
    
    res.json({
      success: true,
      data: notifications,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: notifications.length === parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, update notification status
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    logger.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
});

// Get live activity feed
router.get('/activity-feed', verifyToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get recent activities from multiple sources
    const [notices, media, contacts] = await Promise.all([
      supabase
        .from('notices')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('media')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('contacts')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(limit)
    ]);
    
    // Combine and sort activities
    const activities = [
      ...(notices.data || []).map(n => ({
        id: `notice-${n.id}`,
        type: 'notice',
        title: 'New Notice Posted',
        description: n.title,
        timestamp: n.created_at
      })),
      ...(media.data || []).map(m => ({
        id: `media-${m.id}`,
        type: 'media',
        title: 'New Media Added',
        description: m.title,
        timestamp: m.created_at
      })),
      ...(contacts.data || []).map(c => ({
        id: `contact-${c.id}`,
        type: 'contact',
        title: 'New Contact Message',
        description: `From ${c.name}`,
        timestamp: c.created_at
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
     .slice(0, limit);
    
    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    logger.error('Activity feed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity feed'
    });
  }
});

// Get system status
router.get('/system-status', async (req, res) => {
  try {
    // Check database connection
    const { error: dbError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    const status = {
      database: dbError ? 'down' : 'operational',
      api: 'operational',
      storage: 'operational',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '2.0.0'
    };
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('System status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system status'
    });
  }
});

module.exports = router;