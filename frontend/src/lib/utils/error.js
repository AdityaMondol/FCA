// Error handling utilities
export class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Error codes mapping
export const ERROR_CODES = {
  // Authentication errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_ERROR: 'AUTH_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  PROFILE_FETCH_ERROR: 'PROFILE_FETCH_ERROR',
  PROFILE_UPDATE_ERROR: 'PROFILE_UPDATE_ERROR',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELDS: 'MISSING_REQUIRED_FIELDS',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  SERVER_ERROR: 'SERVER_ERROR',
  
  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED'
};

// Error messages mapping
export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_REQUIRED]: 'Authentication required. Please log in.',
  [ERROR_CODES.AUTH_ERROR]: 'Authentication error. Please try again.',
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password.',
  [ERROR_CODES.EMAIL_NOT_VERIFIED]: 'Please verify your email address.',
  [ERROR_CODES.ACCOUNT_LOCKED]: 'Account locked. Please contact support.',
  [ERROR_CODES.PROFILE_FETCH_ERROR]: 'Failed to fetch user profile.',
  [ERROR_CODES.PROFILE_UPDATE_ERROR]: 'Failed to update user profile.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ERROR_CODES.MISSING_REQUIRED_FIELDS]: 'Please fill in all required fields.',
  [ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection.',
  [ERROR_CODES.TIMEOUT_ERROR]: 'Request timeout. Please try again.',
  [ERROR_CODES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_CODES.FORBIDDEN]: 'Access forbidden. You do not have permission.',
  [ERROR_CODES.SERVER_ERROR]: 'Server error. Please try again later.',
  [ERROR_CODES.RATE_LIMITED]: 'Too many requests. Please try again later.'
};

// Format error for display
export function formatError(error) {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR];
  }
  
  if (error.name === 'TimeoutError') {
    return ERROR_MESSAGES[ERROR_CODES.TIMEOUT_ERROR];
  }
  
  return error.message || 'An unexpected error occurred.';
}

// Log error for debugging
export function logError(error, context = '') {
  console.error(`[${new Date().toISOString()}] ${context}:`, {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: error.code,
    statusCode: error.statusCode
  });
}

// Handle API errors
export function handleApiError(error) {
  logError(error, 'API Error');
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new AppError(
      ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
      ERROR_CODES.NETWORK_ERROR
    );
  }
  
  if (error.message.includes('timeout')) {
    return new AppError(
      ERROR_MESSAGES[ERROR_CODES.TIMEOUT_ERROR],
      ERROR_CODES.TIMEOUT_ERROR
    );
  }
  
  // Handle HTTP status codes
  if (error.statusCode) {
    switch (error.statusCode) {
      case 400:
        return new AppError(
          error.message || ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR],
          ERROR_CODES.VALIDATION_ERROR,
          400
        );
      case 401:
        return new AppError(
          ERROR_MESSAGES[ERROR_CODES.AUTH_REQUIRED],
          ERROR_CODES.AUTH_REQUIRED,
          401
        );
      case 403:
        return new AppError(
          ERROR_MESSAGES[ERROR_CODES.FORBIDDEN],
          ERROR_CODES.FORBIDDEN,
          403
        );
      case 404:
        return new AppError(
          ERROR_MESSAGES[ERROR_CODES.NOT_FOUND],
          ERROR_CODES.NOT_FOUND,
          404
        );
      case 429:
        return new AppError(
          ERROR_MESSAGES[ERROR_CODES.RATE_LIMITED],
          ERROR_CODES.RATE_LIMITED,
          429
        );
      default:
        return new AppError(
          error.message || ERROR_MESSAGES[ERROR_CODES.SERVER_ERROR],
          ERROR_CODES.SERVER_ERROR,
          error.statusCode
        );
    }
  }
  
  return new AppError(
    error.message || 'An unexpected error occurred.',
    ERROR_CODES.UNKNOWN_ERROR
  );
}