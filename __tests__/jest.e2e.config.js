const baseConfig = require('../jest.config');

module.exports = {
  ...baseConfig,
  displayName: 'E2E',
  testMatch: ['**/__tests__/e2e/**/*.test.ts'],
  // Timeout très long pour les tests end-to-end
  testTimeout: 60000,
  setupFilesAfterEnv: ['<rootDir>/setup.ts'], // Explicitly set the path relative to __tests__
};
