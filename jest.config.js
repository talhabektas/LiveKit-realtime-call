module.exports = {
  projects: [
    {
      displayName: 'utils',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/utils/**/__tests__/**/*.test.ts'],
      transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@livekit/.*|livekit-client)',
      ],
    },
    {
      displayName: 'native',
      preset: 'jest-expo',
      testMatch: ['<rootDir>/src/!(utils)/**/__tests__/**/*.test.{ts,tsx}', '<rootDir>/src/__tests__/**/*.test.{ts,tsx}'],
      setupFiles: ['./jest.native.setup.js'],
      setupFilesAfterEnv: ['./jest.setup.js'],
      moduleNameMapper: {
        '^react-native/Libraries/BatchedBridge/NativeModules$': '<rootDir>/src/__mocks__/NativeModulesMock.js',
      },
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@livekit/.*|livekit-client)',
      ],
    },
  ],
};
