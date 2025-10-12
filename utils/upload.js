// Enhanced file upload and storage utilities
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

// File type validation
const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'],
  videos: ['video/mp4', 'video/webm', 'video/ogg'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  profilePhotos: 2 * 1024 * 1024, // 2MB
  media: 10 * 1024 * 1024, // 10MB
  documents: 5 * 1024 * 1024 // 5MB
};

// Image processing options
const IMAGE_PROCESSING_OPTIONS = {
  profilePhotos: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 80
  },
  media: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 85
  }
};

// Configure multer storage
const configureStorage = (destination = 'uploads/') => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
};

// Memory storage for direct processing
const memoryStorage = multer.memoryStorage();

// File filter function
const fileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
  };
};

// Configure multer with limits and file filter
const configureMulter = (options = {}) => {
  const {
    storage = memoryStorage,
    fileSize = FILE_SIZE_LIMITS.media,
    allowedTypes = ALLOWED_FILE_TYPES.images,
    fieldName = 'file'
  } = options;

  return multer({
    storage,
    limits: { fileSize },
    fileFilter: fileFilter(allowedTypes)
  });
};

// Process image with sharp
const processImage = async (buffer, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 85,
    format = 'jpeg'
  } = options;

  try {
    let image = sharp(buffer);
    
    // Resize image
    image = image.resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true
    });
    
    // Convert to specified format with quality
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        image = image.jpeg({ quality });
        break;
      case 'png':
        image = image.png({ quality });
        break;
      case 'webp':
        image = image.webp({ quality });
        break;
      default:
        image = image.jpeg({ quality });
    }
    
    // Convert to buffer
    const processedBuffer = await image.toBuffer();
    
    return {
      success: true,
      buffer: processedBuffer,
      info: await image.metadata()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Validate file type
const validateFileType = (mimetype, allowedTypes) => {
  return allowedTypes.includes(mimetype);
};

// Validate file size
const validateFileSize = (size, maxSize) => {
  return size <= maxSize;
};

// Get file type category
const getFileTypeCategory = (mimetype) => {
  if (ALLOWED_FILE_TYPES.images.includes(mimetype)) {
    return 'image';
  } else if (ALLOWED_FILE_TYPES.videos.includes(mimetype)) {
    return 'video';
  } else if (ALLOWED_FILE_TYPES.documents.includes(mimetype)) {
    return 'document';
  } else {
    return 'other';
  }
};

// Generate file name
const generateFileName = (originalName, prefix = '') => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  return `${prefix}${timestamp}-${randomString}${extension}`;
};

// Upload to Supabase Storage
const uploadToSupabase = async (supabase, bucket, fileName, buffer, contentType) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType,
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      success: true,
      url: publicUrl,
      path: data.path
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete from Supabase Storage
const deleteFromSupabase = async (supabase, bucket, fileName) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// File upload middleware for different use cases
const uploadMiddlewares = {
  // Profile photo upload
  profilePhoto: configureMulter({
    storage: memoryStorage,
    fileSize: FILE_SIZE_LIMITS.profilePhotos,
    allowedTypes: ALLOWED_FILE_TYPES.images,
    fieldName: 'profile_photo'
  }),
  
  // Media upload
  media: configureMulter({
    storage: memoryStorage,
    fileSize: FILE_SIZE_LIMITS.media,
    allowedTypes: [...ALLOWED_FILE_TYPES.images, ...ALLOWED_FILE_TYPES.videos],
    fieldName: 'file'
  }),
  
  // Document upload
  document: configureMulter({
    storage: memoryStorage,
    fileSize: FILE_SIZE_LIMITS.documents,
    allowedTypes: ALLOWED_FILE_TYPES.documents,
    fieldName: 'document'
  })
};

// Ready-to-use middleware functions
const uploadProfilePhoto = uploadMiddlewares.profilePhoto.single('profile_photo');
const uploadMedia = uploadMiddlewares.media.single('file');
const uploadDocument = uploadMiddlewares.document.single('document');

module.exports = {
  ALLOWED_FILE_TYPES,
  FILE_SIZE_LIMITS,
  IMAGE_PROCESSING_OPTIONS,
  configureStorage,
  memoryStorage,
  fileFilter,
  configureMulter,
  processImage,
  validateFileType,
  validateFileSize,
  getFileTypeCategory,
  generateFileName,
  uploadToSupabase,
  deleteFromSupabase,
  uploadMiddlewares,
  uploadProfilePhoto,
  uploadMedia,
  uploadDocument
};