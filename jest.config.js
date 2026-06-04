module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          allowJs: true,
          esModuleInterop: true,
          module: 'CommonJS',
        },
        diagnostics: false,
      },
    ],
  },
  moduleNameMapper: {
    '\\.(glsl|vert|frag)$': '<rootDir>/src/__mocks__/fileMock.js',
    '\\.(png|jpg|jpeg|gif|svg|mp3|wav|avif|webp)$': '<rootDir>/src/__mocks__/fileMock.js',
    '\\.css$': 'identity-obj-proxy',
    '^../services/api$': '<rootDir>/src/__mocks__/apiMock.ts',
    '^../../services/api$': '<rootDir>/src/__mocks__/apiMock.ts',
    '^./api$': '<rootDir>/src/__mocks__/apiMock.ts',
  },
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js|jsx)',
    '**/?(*.)+(spec|test).(ts|tsx|js|jsx)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/backend/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js}',
    '!src/**/*.d.ts',
    '!src/folio/models/**',
    '!src/folio/sounds/**',
    '!src/folio/favicon/**',
    '!src/folio/images/**',
    '!src/folio/index.js',
    '!src/main.tsx',
    '!src/three-elements.ts',
  ],
};
