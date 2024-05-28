module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'clover', 'text'],
  collectCoverageFrom: [
    './**/*.{ts,tsx}',
    '!**/*.test.{ts,tsx}',
    '!**/*.spec.ts',
    '!**/*.d.ts',
    '!**/coverage/**',
    '!**/tailwind.config.ts',
    // e2e testing
    '!**/components/**',
    '!**/app/home/**',
    '!**/app/test/**',
    '!**/app/classify/**',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['/node_modules/'],
};
