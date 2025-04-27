const baseConfig = require('../jest.config');

module.exports = {
  ...baseConfig,
  displayName: 'INTEGRATION',
  testMatch: ['**/__tests__/integration/**/*.test.ts'],
  setupFilesAfterEnv: undefined,
  maxWorkers: 1,
  testTimeout: 30000
}; 