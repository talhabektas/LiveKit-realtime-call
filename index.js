// Step 1: Polyfill DOMException before anything else
if (typeof global.DOMException === 'undefined') {
  var DOMExceptionPolyfill = function(message, name) {
    this.message = message || '';
    this.name = name || 'DOMException';
    this.stack = new Error(message).stack;
  };
  DOMExceptionPolyfill.prototype = Object.create(Error.prototype);
  DOMExceptionPolyfill.prototype.constructor = DOMExceptionPolyfill;
  global.DOMException = DOMExceptionPolyfill;
}

// Step 2: Polyfill navigator for LiveKit platform detection
if (typeof global.navigator === 'undefined') {
  global.navigator = { userAgent: 'react-native' };
} else if (typeof global.navigator.userAgent === 'undefined') {
  global.navigator.userAgent = 'react-native';
}

// Step 3: Register WebRTC globals BEFORE any LiveKit module is imported
var webrtc = require('@livekit/react-native-webrtc');
webrtc.registerGlobals();

// Step 3: Load the app
require('expo/AppEntry');
