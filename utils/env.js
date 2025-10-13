// Environment variable validation
const { logger } = require('./log');

const requiredVariables = [
  'JWT_SECRET',
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'FRONTEND_URL'
];

// Optional variables with defaults
const optionalVariables = {
  'NODE_ENV': 'development',
  'PORT': '3000',
  'JWT_EXPIRES_IN': '24h',
  'REFRESH_TOKEN_EXPIRES_IN': '7d',
  'SESSION_MAX_AGE': (24 * 60 * 60 * 1000).toString(), // 24 hours
  'REFRESH_TOKEN_MAX_AGE': (7 * 24 * 60 * 60 * 1000).toString(), // 7 days
  'AUTH_RATE_LIMIT_WINDOW_MS': (15 * 60 * 1000).toString(), // 15 minutes
  'AUTH_RATE_LIMIT_MAX': '20',
  'ROLE_CHANGE_RATE_LIMIT_WINDOW_MS': (60 * 60 * 1000).toString(), // 1 hour
  'ROLE_CHANGE_RATE_LIMIT_MAX': '3'
};

const validateEnv = () => {
  // Check required variables
  const missingVariables = requiredVariables.filter(variable => !process.env[variable]);

  if (missingVariables.length > 0) {
    logger.error(`Missing required environment variables: ${missingVariables.join(', ')}`);
    process.exit(1);
  }

  // Set defaults for optional variables
  Object.keys(optionalVariables).forEach(variable => {
    if (!process.env[variable]) {
      process.env[variable] = optionalVariables[variable];
      logger.info(`Using default value for ${variable}: ${optionalVariables[variable]}`);
    }
  });

  logger.info('Environment variables validated successfully');
};

module.exports = { validateEnv };