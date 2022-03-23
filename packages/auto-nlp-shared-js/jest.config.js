module.exports = {
  resolver: require.resolve(`jest-pnp-resolver`),
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  reporters: ['default', 'jest-junit'],
  testRegex: '.*\\.spec\\.ts$',

  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
