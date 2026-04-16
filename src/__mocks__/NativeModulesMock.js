'use strict';
// jest-expo v53 + react-native 0.76 compatibility shim.
// jest-expo/src/preset/setup.js does `require(...NativeModules).default`
// but the RN 0.76 jest mock doesn't expose `.default`.
// We proxy the RN mock and add `.default = self`.
const mockNativeModules = jest.requireMock('react-native/Libraries/BatchedBridge/NativeModules') ??
  jest.requireActual('react-native/Libraries/BatchedBridge/NativeModules');

// Ensure UIManager exists for jest-expo's viewManagersMetadata loop
if (!mockNativeModules.UIManager) {
  mockNativeModules.UIManager = {};
}

mockNativeModules.default = mockNativeModules;
module.exports = mockNativeModules;
