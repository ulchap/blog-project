module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    // Любой импорт вида "src/..."
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  // Искать модули не только в node_modules, но и в папке src
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: 'node',
};
