const baseConfig = require('../jest.config');

module.exports = {
  ...baseConfig,
  displayName: 'UNIT',
  testMatch: ['**/__tests__/unit/**/*.test.ts'],
  // Exécution plus rapide pour les tests unitaires
  maxWorkers: '50%',
  setupFilesAfterEnv: undefined
}; 