module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/lib/**/*.{js,mjs}'],
  coverageDirectory: './coverage/',
  moduleFileExtensions: ['js', 'mjs'],
  moduleNameMapper: {
    '^.+?stormlib\\.debug\\.js$': '<rootDir>/dist/stormlib.debug.js',
    '^.+?stormlib\\.release\\.js$': '<rootDir>/dist/stormlib.release.js',
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.m?js$': 'babel-jest',
  },
  transformIgnorePatterns: ['^.+?stormlib\\.(debug|release)\\.js$'],
};
