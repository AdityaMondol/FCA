const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { logger } = require('../utils/log');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Advanced search across all content
router.get('/', async (req, res) => {
  try {
    const { q, type, limit = 20, offset = 0 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }
    
    const searchTerm = `%${q.trim()}%`;
    const results = {
      notices: [],
      media: [],
      teachers: [],
      total: 0
    };
    
    // Search notices
    if (!type || type === 'notices') {
      const { data: notices, error: noticesError } = await supabase
        .from('notices')
        .select('*')
        .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);
      
      if (!noticesError && notices) {
        results.notices = notices.map(notice => ({
          ...notice,
          type: 'notice',
          relevance: calculateRelevance(q, notice.title, notice.content)
        }));
      }
    }
    
    // Search media
    if (!type || type === 'media') {
      const { data: media, error: mediaError } = await supabase
        .from('media')
        .select('*')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);
      
      if (!mediaError && media) {
        results.media = media.map(item => ({
          ...item,
          type: 'media',
          relevance: calculateRelevance(q, item.title, item.description)
        }));
      }
    }
    
    // Search teachers
    if (!type || type === 'teachers') {
      const { data: teachers, error: teachersError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'teacher')
        .or(`name.ilike.${searchTerm},bio.ilike.${searchTerm}`)
        .range(offset, offset + parseInt(limit) - 1);
      
      if (!teachersError && teachers) {
        results.teachers = teachers.map(teacher => ({
          ...teacher,
          type: 'teacher',
          relevance: calculateRelevance(q, teacher.name, teacher.bio)
        }));
      }
    }
    
    // Combine and sort by relevance
    const allResults = [
      ...results.notices,
      ...results.media,
      ...results.teachers
    ].sort((a, b) => b.relevance - a.relevance);
    
    results.total = allResults.length;
    results.combined = allResults.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: results,
      query: q,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: results.total
      }
    });
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
});

// Search suggestions/autocomplete
router.get('/suggestions', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const searchTerm = `${q.trim()}%`;
    const suggestions = [];
    
    // Get notice titles
    const { data: notices } = await supabase
      .from('notices')
      .select('title')
      .ilike('title', searchTerm)
      .limit(limit);
    
    if (notices) {
      suggestions.push(...notices.map(n => ({
        text: n.title,
        type: 'notice'
      })));
    }
    
    // Get media titles
    const { data: media } = await supabase
      .from('media')
      .select('title')
      .ilike('title', searchTerm)
      .limit(limit);
    
    if (media) {
      suggestions.push(...media.map(m => ({
        text: m.title,
        type: 'media'
      })));
    }
    
    // Remove duplicates and limit
    const uniqueSuggestions = Array.from(
      new Map(suggestions.map(s => [s.text, s])).values()
    ).slice(0, limit);
    
    res.json({
      success: true,
      data: uniqueSuggestions
    });
  } catch (error) {
    logger.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch suggestions'
    });
  }
});

// Calculate relevance score
function calculateRelevance(query, ...fields) {
  const lowerQuery = query.toLowerCase();
  let score = 0;
  
  fields.forEach(field => {
    if (!field) return;
    
    const lowerField = field.toString().toLowerCase();
    
    // Exact match
    if (lowerField === lowerQuery) {
      score += 100;
    }
    // Starts with query
    else if (lowerField.startsWith(lowerQuery)) {
      score += 50;
    }
    // Contains query
    else if (lowerField.includes(lowerQuery)) {
      score += 25;
    }
    // Word match
    else {
      const words = lowerQuery.split(' ');
      words.forEach(word => {
        if (lowerField.includes(word)) {
          score += 10;
        }
      });
    }
  });
  
  return score;
}

module.exports = router;