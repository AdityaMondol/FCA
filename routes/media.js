
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { validate } = require('../utils/validate');
const { logger } = require('../utils/log');
const auth = require('../utils/auth');
const authenticateToken = auth.sessionMiddleware;
const authorizeRole = auth.roleMiddleware;
const { uploadMedia, processImage, generateFileName, uploadToSupabase, deleteFromSupabase, IMAGE_PROCESSING_OPTIONS } = require('../utils/upload');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all media items with pagination
router.get('/', async (req, res) => {
  try {
    // Add pagination support
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await supabase
      .from('media')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// Upload media (Teacher only)
router.post('/', authenticateToken, authorizeRole('teacher', 'admin'), uploadMedia, async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
      logger.warn('Media upload failed - no file provided', {
        userId: req.user.id
      });
      return res.status(400).json({ error: 'File is required' });
    }

    logger.info('Processing media upload', {
      userId: req.user.id,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype
    });

    // Process image if it's an image file
    let fileBuffer = file.buffer;
    let fileMimeType = file.mimetype;
    
    if (file.mimetype.startsWith('image/')) {
      logger.debug('Processing image file', {
        userId: req.user.id,
        fileName: file.originalname
      });
      
      const processStartTime = Date.now();
      const processedImage = await processImage(file.buffer, IMAGE_PROCESSING_OPTIONS.media);
      const processDuration = Date.now() - processStartTime;
      
      logger.file('PROCESS', file.originalname, processDuration, 
        processedImage.success ? null : new Error(processedImage.error));
      
      if (processedImage.success) {
        fileBuffer = processedImage.buffer;
        // Update mime type if format changed
        if (processedImage.info.format) {
          fileMimeType = `image/${processedImage.info.format}`;
        }
      }
    }

    // Generate file name
    const fileName = generateFileName(file.originalname);
    
    // Upload to Supabase Storage
    const uploadStartTime = Date.now();
    const uploadResult = await uploadToSupabase(
      supabase, 
      'media', 
      fileName, 
      fileBuffer, 
      fileMimeType
    );
    const uploadDuration = Date.now() - uploadStartTime;
    
    logger.file('UPLOAD', fileName, uploadDuration, 
      uploadResult.success ? null : new Error(uploadResult.error));

    if (!uploadResult.success) {
      throw new Error(uploadResult.error);
    }

    // Save metadata to database
    const fileType = file.mimetype.startsWith('image/') ? 'image' : 
                   file.mimetype.startsWith('video/') ? 'video' : 'other';
                   
    logger.info('Saving media metadata', {
      userId: req.user.id,
      fileName,
      fileType
    });
    
    const dbStartTime = Date.now();
    const { data, error } = await supabase
      .from('media')
      .insert([
        {
          title,
          description,
          url: uploadResult.url,
          type: fileType,
          date: new Date().toISOString(),
          uploaded_by: req.user.id
        }
      ]);
    
    const dbDuration = Date.now() - dbStartTime;
    logger.database('INSERT', 'media', dbDuration, error);

    if (error) throw error;

    // Clear media cache
    if (typeof mediaCache !== 'undefined') {
      mediaCache.data = null;
      mediaCache.timestamp = 0;
    }

    logger.info('✅ Media uploaded successfully', {
      userId: req.user.id,
      mediaId: data?.[0]?.id,
      url: uploadResult.url
    });

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error uploading media', {
      userId: req.user.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

// Delete media (Teacher only)
router.delete('/:id', authenticateToken, authorizeRole('teacher', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // First get the media item to get the file path
    const { data: mediaItem, error: fetchError } = await supabase
      .from('media')
      .select('url')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch media item: ${fetchError.message}`);
    }

    if (!mediaItem) {
      return res.status(404).json({ error: 'Media item not found' });
    }

    // Extract file name from URL
    const urlParts = mediaItem.url.split('/');
    const fileName = urlParts[urlParts.length - 1];

    // Delete from Supabase Storage
    const deleteResult = await deleteFromSupabase(supabase, 'media', fileName);
    
    if (!deleteResult.success) {
      console.warn('Failed to delete file from storage:', deleteResult.error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Clear media cache
    if (typeof mediaCache !== 'undefined') {
      mediaCache.data = null;
      mediaCache.timestamp = 0;
    }

    res.json({ success: true, message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

module.exports = router;
