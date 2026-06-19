module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Transform ts-jest's default plus jose's ESM-only .js files.
  // jose v6 ships pure ESM; jwks-rsa v4 requires it; without this, every
  // test that touches the OAuth route chain fails at parse time.
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['ts-jest', { tsconfig: { allowJs: true, esModuleInterop: true } }],
  },
  transformIgnorePatterns: ['node_modules/(?!(jose)/)'],
  collectCoverageFrom: [
    'controllers/**/*.ts',
    'routes/**/*.ts',
    'middleware/**/*.ts',
    'services/**/*.ts',
    '!**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
};
