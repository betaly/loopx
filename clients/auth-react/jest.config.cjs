module.exports = {
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest'],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testMatch: ['**/?(*.)+(spec|test|unit|integration|acceptance).[jt]s?(x)'],
  testPathIgnorePatterns: ['node_modules', 'dist'],
  testEnvironment: 'jsdom',
  coverageReporters: ['html', 'text', 'text-summary', 'cobertura'],
};
