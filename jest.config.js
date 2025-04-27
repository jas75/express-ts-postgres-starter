module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/config/**/*.ts', '!src/index.ts'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  maxWorkers: 1, // Run tests sequentially to avoid port conflicts
  forceExit: true, // Force Jest to exit after all tests are complete
};
