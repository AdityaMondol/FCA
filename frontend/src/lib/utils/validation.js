// Form validation utilities

export const validators = {
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  
  password: (value) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(value);
  },
  
  phone: (value) => {
    // Bangladesh phone number format
    const phoneRegex = /^(\+88)?01[3-9]\d{8}$/;
    return phoneRegex.test(value);
  },
  
  required: (value) => {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  },
  
  minLength: (value, min) => {
    return value && value.length >= min;
  },
  
  maxLength: (value, max) => {
    return value && value.length <= max;
  }
};

export const validateForm = (data, rules) => {
  const errors = {};
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    
    for (const rule of fieldRules) {
      if (typeof rule === 'string') {
        // Simple validator name
        if (!validators[rule](value)) {
          errors[field] = getErrorMessage(field, rule);
          break;
        }
      } else if (typeof rule === 'object') {
        // Validator with parameters
        const { validator, params, message } = rule;
        if (!validators[validator](value, ...params)) {
          errors[field] = message || getErrorMessage(field, validator, params);
          break;
        }
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const getErrorMessage = (field, validator, params = []) => {
  const messages = {
    required: `${field} is required`,
    email: `Please enter a valid email address`,
    password: `Password must be at least 8 characters with uppercase, lowercase, and number`,
    phone: `Please enter a valid Bangladesh phone number`,
    minLength: `${field} must be at least ${params[0]} characters`,
    maxLength: `${field} must not exceed ${params[0]} characters`
  };
  
  return messages[validator] || `${field} is invalid`;
};