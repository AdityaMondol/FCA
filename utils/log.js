// Enhanced logging utility
const fs = require('fs');
const path = require('path');

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Get current log level from environment or default to INFO
const CURRENT_LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL || 'INFO'];

// Log file configuration
const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '../logs');
const LOG_FILE = process.env.LOG_FILE || 'app.log';
const ERROR_LOG_FILE = process.env.ERROR_LOG_FILE || 'error.log';

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Format timestamp
const formatTimestamp = () => {
  return new Date().toISOString();
};

// Format log message
const formatLogMessage = (level, message, meta = {}) => {
  const timestamp = formatTimestamp();
  const formattedMeta = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
  
  return `${timestamp} [${level}] ${message} ${formattedMeta}`.trim();
};

// Write to file
const writeToFile = (filePath, message) => {
  try {
    fs.appendFileSync(filePath, message + '\n', 'utf8');
  } catch (error) {
    // If we can't write to file, fallback to console
    console.error('Failed to write to log file:', error.message);
    console.log(message);
  }
};

// Get log file path
const getLogFilePath = (fileName) => {
  return path.join(LOG_DIR, fileName);
};

// Main logger class
class Logger {
  constructor() {
    this.logLevel = CURRENT_LOG_LEVEL;
    this.logFilePath = getLogFilePath(LOG_FILE);
    this.errorLogFilePath = getLogFilePath(ERROR_LOG_FILE);
  }

  // Check if log level is enabled
  isLevelEnabled(level) {
    return LOG_LEVELS[level] <= this.logLevel;
  }

  // Log error
  error(message, meta = {}) {
    if (!this.isLevelEnabled('ERROR')) return;
    
    const logMessage = formatLogMessage('ERROR', message, meta);
    console.error(`\x1b[31m${logMessage}\x1b[0m`); // Red color
    writeToFile(this.errorLogFilePath, logMessage);
    
    // Also write to general log file
    writeToFile(this.logFilePath, logMessage);
  }

  // Log warning
  warn(message, meta = {}) {
    if (!this.isLevelEnabled('WARN')) return;
    
    const logMessage = formatLogMessage('WARN', message, meta);
    console.warn(`\x1b[33m${logMessage}\x1b[0m`); // Yellow color
    writeToFile(this.logFilePath, logMessage);
  }

  // Log info
  info(message, meta = {}) {
    if (!this.isLevelEnabled('INFO')) return;
    
    const logMessage = formatLogMessage('INFO', message, meta);
    console.info(`\x1b[36m${logMessage}\x1b[0m`); // Cyan color
    writeToFile(this.logFilePath, logMessage);
  }

  // Log debug
  debug(message, meta = {}) {
    if (!this.isLevelEnabled('DEBUG')) return;
    
    const logMessage = formatLogMessage('DEBUG', message, meta);
    console.debug(`\x1b[35m${logMessage}\x1b[0m`); // Magenta color
    writeToFile(this.logFilePath, logMessage);
  }

  // Log HTTP request (only errors and important routes)
  http(req, res, duration) {
    if (!this.isLevelEnabled('INFO')) return;
    
    // Skip logging for successful requests to reduce noise
    // Only log errors or slow requests
    if (res.statusCode < 400 && duration < 1000) {
      return;
    }
    
    const meta = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    };
    
    const message = `${req.method} ${req.url}`;
    const logMessage = formatLogMessage('HTTP', message, meta);
    
    // Color code based on status
    let color = '\x1b[32m'; // Green for success
    if (res.statusCode >= 400 && res.statusCode < 500) {
      color = '\x1b[33m'; // Yellow for client errors
    } else if (res.statusCode >= 500) {
      color = '\x1b[31m'; // Red for server errors
    }
    
    console.log(`${color}${logMessage}\x1b[0m`);
    writeToFile(this.logFilePath, logMessage);
  }

  // Log database operation
  database(operation, table, duration, error = null) {
    if (!this.isLevelEnabled('DEBUG')) return;
    
    const meta = {
      operation,
      table,
      duration: `${duration}ms`,
      error: error ? error.message : undefined
    };
    
    const message = `DB ${operation} on ${table}`;
    const logMessage = formatLogMessage('DB', message, meta);
    
    if (error) {
      console.error(`\x1b[31m${logMessage}\x1b[0m`);
      writeToFile(this.errorLogFilePath, logMessage);
    } else {
      console.debug(`\x1b[34m${logMessage}\x1b[0m`); // Blue color
    }
    
    writeToFile(this.logFilePath, logMessage);
  }

  // Log authentication event
  auth(event, userId, email, success = true, error = null) {
    const meta = {
      event,
      userId,
      email,
      success,
      error: error ? error.message : undefined
    };
    
    const message = `AUTH ${event} for ${email}`;
    const logMessage = formatLogMessage('AUTH', message, meta);
    
    if (success) {
      if (this.isLevelEnabled('INFO')) {
        console.info(`\x1b[32m${logMessage}\x1b[0m`); // Green color
        writeToFile(this.logFilePath, logMessage);
      }
    } else {
      if (this.isLevelEnabled('WARN')) {
        console.warn(`\x1b[31m${logMessage}\x1b[0m`); // Red color
        writeToFile(this.errorLogFilePath, logMessage);
        writeToFile(this.logFilePath, logMessage);
      }
    }
  }

  // Log file operation
  file(operation, fileName, duration, error = null) {
    const meta = {
      operation,
      fileName,
      duration: `${duration}ms`,
      error: error ? error.message : undefined
    };
    
    const message = `FILE ${operation} on ${fileName}`;
    const logMessage = formatLogMessage('FILE', message, meta);
    
    if (error) {
      if (this.isLevelEnabled('ERROR')) {
        console.error(`\x1b[31m${logMessage}\x1b[0m`);
        writeToFile(this.errorLogFilePath, logMessage);
        writeToFile(this.logFilePath, logMessage);
      }
    } else {
      if (this.isLevelEnabled('DEBUG')) {
        console.debug(`\x1b[34m${logMessage}\x1b[0m`); // Blue color
        writeToFile(this.logFilePath, logMessage);
      }
    }
  }
}

// Create singleton instance
const logger = new Logger();

// Express middleware for HTTP logging
const httpLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Capture response finish to log completion
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.http(req, res, duration);
  });
  
  // Continue with request
  next();
};

// Error handling middleware
const errorLogger = (error, req, res, next) => {
  logger.error('Unhandled error', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  next(error);
};

module.exports = {
  logger,
  httpLogger,
  errorLogger,
  LOG_LEVELS
};