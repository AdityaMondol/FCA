const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { verifyToken } = require('../utils/auth');
const { logger } = require('../utils/log');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get dashboard analytics
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user stats
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    // Get total counts
    const [noticesCount, mediaCount, teachersCount, contactsCount] = await Promise.all([
      supabase.from('notices').select('id', { count: 'exact', head: true }),
      supabase.from('media').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'teacher'),
      supabase.from('contacts').select('id', { count: 'exact', head: true })
    ]);
    
    // Get recent activities
    const { data: recentNotices } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    const { data: recentMedia } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    res.json({
      success: true,
      data: {
        user,
        stats: {
          notices: noticesCount.count || 0,
          media: mediaCount.count || 0,
          teachers: teachersCount.count || 0,
          contacts: contactsCount.count || 0
        },
        recentActivities: {
          notices: recentNotices || [],
          media: recentMedia || []
        }
      }
    });
  } catch (error) {
    logger.error('Analytics dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data'
    });
  }
});

// Get visitor statistics
router.get('/visitors', verifyToken, async (req, res) => {
  try {
    // This would typically come from a separate analytics service
    // For now, return mock data structure
    const stats = {
      today: Math.floor(Math.random() * 500) + 100,
      thisWeek: Math.floor(Math.random() * 3000) + 500,
      thisMonth: Math.floor(Math.random() * 10000) + 2000,
      total: Math.floor(Math.random() * 50000) + 10000,
      trend: {
        daily: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          visitors: Math.floor(Math.random() * 500) + 100
        }))
      }
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Visitor stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch visitor statistics'
    });
  }
});

// Get content performance
router.get('/content-performance', verifyToken, async (req, res) => {
  try {
    const { data: notices } = await supabase
      .from('notices')
      .select('id, title, created_at, views')
      .order('views', { ascending: false })
      .limit(10);
    
    const { data: media } = await supabase
      .from('media')
      .select('id, title, created_at, views')
      .order('views', { ascending: false })
      .limit(10);
    
    res.json({
      success: true,
      data: {
        topNotices: notices || [],
        topMedia: media || []
      }
    });
  } catch (error) {
    logger.error('Content performance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content performance'
    });
  }
});

// Get user engagement metrics
router.get('/engagement', verifyToken, async (req, res) => {
  try {
    const { data: users } = await supabase
      .from('users')
      .select('role')
      .neq('role', 'teacher');
    
    const roleDistribution = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        totalUsers: users.length,
        roleDistribution,
        activeUsers: Math.floor(users.length * 0.7), // Mock active users
        newUsersThisMonth: Math.floor(users.length * 0.1) // Mock new users
      }
    });
  } catch (error) {
    logger.error('Engagement metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch engagement metrics'
    });
  }
});

module.exports = router;