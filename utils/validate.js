// Input validation and sanitization utilities
const validator = {
  // Email validation
  isEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Phone number validation (Bangladesh format)
  isPhoneNumber: (phone) => {
    const phoneRegex = /^(\+88)?01[3-9]\d{8}$/;
    return phoneRegex.test(phone);
  },
  
  // Name validation
  isName: (name) => {
    // Allow letters, spaces, hyphens, and common Bengali characters
    const nameRegex = /^[a-zA-Z\u0980-\u09FF\s\-']+$/;
    return nameRegex.test(name) && name.length >= 2 && name.length <= 50;
  },
  
  // Password validation
  isPassword: (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },
  
  // Role validation
  isValidRole: (role) => {
    const validRoles = ['student', 'guardian', 'teacher'];
    return validRoles.includes(role);
  },
  
  // Text length validation
  isTextLengthValid: (text, min = 1, max = 1000) => {
    return text && text.length >= min && text.length <= max;
  },
  
  // URL validation
  isUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  // Array validation
  isArray: (arr) => {
    return Array.isArray(arr);
  },
  
  // Number validation
  isNumber: (num) => {
    return typeof num === 'number' && !isNaN(num);
  },
  
  // Integer validation
  isInteger: (num) => {
    return Number.isInteger(num);
  },
  
  // Positive number validation
  isPositive: (num) => {
    return validator.isNumber(num) && num > 0;
  }
};

// Sanitization functions
const sanitizer = {
  // Remove HTML tags
  stripHtml: (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/<[^>]*>/g, '');
  },
  
  // Escape HTML entities
  escapeHtml: (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  },
  
  // Trim whitespace
  trim: (str) => {
    if (typeof str !== 'string') return str;
    return str.trim();
  },
  
  // Normalize whitespace
  normalizeWhitespace: (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/\s+/g, ' ');
  },
  
  // Remove special characters except allowed ones
  removeSpecialChars: (str, allowedChars = '') => {
    if (typeof str !== 'string') return str;
    const regex = new RegExp(`[^a-zA-Z0-9\u0980-\u09FF\\s${allowedChars}]`, 'g');
    return str.replace(regex, '');
  }
};

// Validation schemas for different endpoints
const validationSchemas = {
  // Registration validation
  registration: (data) => {
    const errors = [];
    
    if (!data.email) {
      errors.push('Email is required');
    } else if (!validator.isEmail(data.email)) {
      errors.push('Invalid email format');
    }
    
    if (!data.password) {
      errors.push('Password is required');
    } else if (!validator.isPassword(data.password)) {
      errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
    }
    
    if (!data.name) {
      errors.push('Name is required');
    } else if (!validator.isName(data.name)) {
      errors.push('Invalid name format');
    }
    
    if (!data.role) {
      errors.push('Role is required');
    } else if (!validator.isValidRole(data.role)) {
      errors.push('Invalid role');
    }
    
    if (data.phone && !validator.isPhoneNumber(data.phone)) {
      errors.push('Invalid phone number format');
    }
    
    if (data.role === 'teacher' && !data.teacherCode) {
      errors.push('Teacher verification code is required');
    }
    
    return errors;
  },
  
  // Login validation
  login: (data) => {
    const errors = [];
    
    if (!data.email) {
      errors.push('Email is required');
    } else if (!validator.isEmail(data.email)) {
      errors.push('Invalid email format');
    }
    
    if (!data.password) {
      errors.push('Password is required');
    }
    
    return errors;
  },
  
  // Profile update validation
  profileUpdate: (data) => {
    const errors = [];
    
    if (data.name && !validator.isName(data.name)) {
      errors.push('Invalid name format');
    }
    
    if (data.phone && !validator.isPhoneNumber(data.phone)) {
      errors.push('Invalid phone number format');
    }
    
    if (data.description && !validator.isTextLengthValid(data.description, 0, 500)) {
      errors.push('Description must be less than 500 characters');
    }
    
    return errors;
  },
  
  // Notice creation validation
  noticeCreation: (data) => {
    const errors = [];
    
    if (!data.title_en) {
      errors.push('English title is required');
    } else if (!validator.isTextLengthValid(data.title_en, 1, 200)) {
      errors.push('English title must be between 1 and 200 characters');
    }
    
    if (!data.title_bn) {
      errors.push('Bengali title is required');
    } else if (!validator.isTextLengthValid(data.title_bn, 1, 200)) {
      errors.push('Bengali title must be between 1 and 200 characters');
    }
    
    if (!data.content_en) {
      errors.push('English content is required');
    } else if (!validator.isTextLengthValid(data.content_en, 1, 5000)) {
      errors.push('English content must be between 1 and 5000 characters');
    }
    
    if (!data.content_bn) {
      errors.push('Bengali content is required');
    } else if (!validator.isTextLengthValid(data.content_bn, 1, 5000)) {
      errors.push('Bengali content must be between 1 and 5000 characters');
    }
    
    if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
      errors.push('Invalid priority level');
    }
    
    return errors;
  },
  
  // Contact form validation
  contactForm: (data) => {
    const errors = [];
    
    if (!data.name) {
      errors.push('Name is required');
    } else if (!validator.isName(data.name)) {
      errors.push('Invalid name format');
    }
    
    if (!data.email) {
      errors.push('Email is required');
    } else if (!validator.isEmail(data.email)) {
      errors.push('Invalid email format');
    }
    
    if (!data.message) {
      errors.push('Message is required');
    } else if (!validator.isTextLengthValid(data.message, 1, 1000)) {
      errors.push('Message must be between 1 and 1000 characters');
    }
    
    if (data.phone && !validator.isPhoneNumber(data.phone)) {
      errors.push('Invalid phone number format');
    }
    
    return errors;
  }
};

// Main validation function
const validate = (schema, data) => {
  if (!validationSchemas[schema]) {
    throw new Error(`Validation schema '${schema}' not found`);
  }
  
  const errors = validationSchemas[schema](data);
  
  if (errors.length > 0) {
    return {
      isValid: false,
      errors
    };
  }
  
  return {
    isValid: true,
    errors: []
  };
};

// Sanitize input data
const sanitizeInput = (data) => {
  if (typeof data === 'string') {
    return sanitizer.trim(
      sanitizer.normalizeWhitespace(
        sanitizer.stripHtml(data)
      )
    );
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const key in data) {
      sanitized[key] = sanitizeInput(data[key]);
    }
    return sanitized;
  }
  
  return data;
};

module.exports = {
  validator,
  sanitizer,
  validate,
  sanitizeInput
};// Input validation and sanitization utilities
const validator = {
  // Email validation
  isEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Phone number validation (Bangladesh format)
  isPhoneNumber: (phone) => {
    const phoneRegex = /^(\+88)?01[3-9]\d{8}$/;
    return phoneRegex.test(phone);
  },
  
  // Name validation
  isName: (name) => {
    // Allow letters, spaces, hyphens, and common Bengali characters
    const nameRegex = /^[a-zA-Z\u0980-\u09FF\s\-']+$/;
    return nameRegex.test(name) && name.length >= 2 && name.length <= 50;
  },
  
  // Password validation
  isPassword: (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },
  
  // Role validation
  isValidRole: (role) => {
    const validRoles = ['student', 'guardian', 'teacher'];
    return validRoles.includes(role);
  },
  
  // Text length validation
  isTextLengthValid: (text, min = 1, max = 1000) => {
    return text && text.length >= min && text.length <= max;
  },
  
  // URL validation
  isUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  // Array validation
  isArray: (arr) => {
    return Array.isArray(arr);
  },
  
  // Number validation
  isNumber: (num) => {
    return typeof num === 'number' && !isNaN(num);
  },
  
  // Integer validation
  isInteger: (num) => {
    return Number.isInteger(num);
  },
  
  // Positive number validation
  isPositive: (num) => {
    return validator.isNumber(num) && num > 0;
  }
};

// Sanitization functions
const sanitizer = {
  // Remove HTML tags
  stripHtml: (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/<[^>]*>/g, '');
  },
  
  // Escape HTML entities
  escapeHtml: (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  },
  
  // Trim whitespace
  trim: (str) => {
    if (typeof str !== 'string') return str;
    return str.trim();
  },
  
  // Normalize whitespace
  normalizeWhitespace: (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/\s+/g, ' ');
  },
  
  // Remove special characters except allowed ones
  removeSpecialChars: (str, allowedChars = '') => {
    if (typeof str !== 'string') return str;
    const regex = new RegExp(`[^a-zA-Z0-9\u0980-\u09FF\\s${allowedChars}]`, 'g');
    return str.replace(regex, '');
  }
};

// Validation schemas for different endpoints
const validationSchemas = {
  // Registration validation
  registration: (data) => {
    const errors = [];
    
    if (!data.email) {
      errors.push('Email is required');
    } else if (!validator.isEmail(data.email)) {
      errors.push('Invalid email format');
    }
    
    if (!data.password) {
      errors.push('Password is required');
    } else if (!validator.isPassword(data.password)) {
      errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
    }
    
    if (!data.name) {
      errors.push('Name is required');
    } else if (!validator.isName(data.name)) {
      errors.push('Invalid name format');
    }
    
    if (!data.role) {
      errors.push('Role is required');
    } else if (!validator.isValidRole(data.role)) {
      errors.push('Invalid role');
    }
    
    if (data.phone && !validator.isPhoneNumber(data.phone)) {
      errors.push('Invalid phone number format');
    }
    
    if (data.role === 'teacher' && !data.teacherCode) {
      errors.push('Teacher verification code is required');
    }
    
    return errors;
  },
  
  // Login validation
  login: (data) => {
    const errors = [];
    
    if (!data.email) {
      errors.push('Email is required');
    } else if (!validator.isEmail(data.email)) {
      errors.push('Invalid email format');
    }
    
    if (!data.password) {
      errors.push('Password is required');
    }
    
    return errors;
  },
  
  // Profile update validation
  profileUpdate: (data) => {
    const errors = [];
    
    if (data.name && !validator.isName(data.name)) {
      errors.push('Invalid name format');
    }
    
    if (data.phone && !validator.isPhoneNumber(data.phone)) {
      errors.push('Invalid phone number format');
    }
    
    if (data.description && !validator.isTextLengthValid(data.description, 0, 500)) {
      errors.push('Description must be less than 500 characters');
    }
    
    return errors;
  },
  
  // Notice creation validation
  noticeCreation: (data) => {
    const errors = [];
    
    if (!data.title_en) {
      errors.push('English title is required');
    } else if (!validator.isTextLengthValid(data.title_en, 1, 200)) {
      errors.push('English title must be between 1 and 200 characters');
    }
    
    if (!data.title_bn) {
      errors.push('Bengali title is required');
    } else if (!validator.isTextLengthValid(data.title_bn, 1, 200)) {
      errors.push('Bengali title must be between 1 and 200 characters');
    }
    
    if (!data.content_en) {
      errors.push('English content is required');
    } else if (!validator.isTextLengthValid(data.content_en, 1, 5000)) {
      errors.push('English content must be between 1 and 5000 characters');
    }
    
    if (!data.content_bn) {
      errors.push('Bengali content is required');
    } else if (!validator.isTextLengthValid(data.content_bn, 1, 5000)) {
      errors.push('Bengali content must be between 1 and 5000 characters');
    }
    
    if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
      errors.push('Invalid priority level');
    }
    
    return errors;
  },
  
  // Contact form validation
  contactForm: (data) => {
    const errors = [];
    
    if (!data.name) {
      errors.push('Name is required');
    } else if (!validator.isName(data.name)) {
      errors.push('Invalid name format');
    }
    
    if (!data.email) {
      errors.push('Email is required');
    } else if (!validator.isEmail(data.email)) {
      errors.push('Invalid email format');
    }
    
    if (!data.message) {
      errors.push('Message is required');
    } else if (!validator.isTextLengthValid(data.message, 1, 1000)) {
      errors.push('Message must be between 1 and 1000 characters');
    }
    
    if (data.phone && !validator.isPhoneNumber(data.phone)) {
      errors.push('Invalid phone number format');
    }
    
    return errors;
  }
};

// Main validation function
const validate = (schema, data) => {
  if (!validationSchemas[schema]) {
    throw new Error(`Validation schema '${schema}' not found`);
  }
  
  const errors = validationSchemas[schema](data);
  
  if (errors.length > 0) {
    return {
      isValid: false,
      errors
    };
  }
  
  return {
    isValid: true,
    errors: []
  };
};

// Sanitize input data
const sanitizeInput = (data) => {
  if (typeof data === 'string') {
    return sanitizer.trim(
      sanitizer.normalizeWhitespace(
        sanitizer.stripHtml(data)
      )
    );
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const key in data) {
      sanitized[key] = sanitizeInput(data[key]);
    }
    return sanitized;
  }
  
  return data;
};

module.exports = {
  validator,
  sanitizer,
  validate,
  sanitizeInput
};