// Jest setup file for test configuration
const dotenv = require('dotenv');

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'ERROR';

// Mock Redis for tests if needed
jest.mock('redis', () => {
  const mockClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    setEx: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    sAdd: jest.fn().mockResolvedValue(1),
    sMembers: jest.fn().mockResolvedValue([]),
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    ping: jest.fn().mockResolvedValue('PONG'),
    info: jest.fn().mockResolvedValue(''),
    flushDb: jest.fn().mockResolvedValue('OK'),
    on: jest.fn().mockReturnThis()
  };

  return {
    createClient: jest.fn().mockReturnValue(mockClient)
  };
});

// Suppress console output during tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  log: jest.fn()
};

// Set test timeout
jest.setTimeout(30000);
