module.exports = {
  resolver: require.resolve(`jest-pnp-resolver`),
  moduleFileExtensions: ['js', 'json', 'ts'],
  modulePaths: ['src'],
  rootDir: '.',
  reporters: ['default', 'jest-junit'],
  testRegex: '.*\\.spec\\.ts$',

  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageReporters: [ 'json-summary', 'text', 'lcov' ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
