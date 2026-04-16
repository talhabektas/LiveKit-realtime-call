// Provide a non-empty URL so the liveKitUrl guard in RoomScreen passes in tests.
process.env.EXPO_PUBLIC_LIVEKIT_URL = 'wss://test.livekit.example';

// Fix for jest-expo v53 + react-native 0.76 compatibility:
// jest-expo/src/preset/setup.js does `require(...NativeModules).default`
// but RN 0.76 uses `module.exports = NativeModules` (no .default property).
// We patch the module registry so that the `.default` property exists.
'use strict';

const nativeModules = require('react-native/Libraries/BatchedBridge/NativeModules');
if (!nativeModules.default) {
  nativeModules.default = nativeModules;
}
