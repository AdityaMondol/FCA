// Environment variable validation
const { logger } = require('./log');

const requiredVariables = [
  'JWT_SECRET',
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'FRONTEND_URL'
];

const validateEnv = () => {
  const missingVariables = requiredVariables.filter(variable => !process.env[variable]);

  if (missingVariables.length > 0) {
    logger.error(`Missing required environment variables: ${missingVariables.join(', ')}`);
    process.exit(1);
  }
};

module.exports = { validateEnv };
