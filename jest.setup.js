// Native modülleri mock'la
jest.mock('@livekit/react-native-webrtc', () => ({
  registerGlobals: jest.fn(),
  RTCPeerConnection: jest.fn(),
  RTCIceCandidate: jest.fn(),
  RTCSessionDescription: jest.fn(),
  MediaStream: jest.fn(),
  MediaStreamTrack: jest.fn(),
}));

jest.mock('@livekit/react-native', () => ({
  LiveKitRoom: ({ children }) => children,
  useParticipants: jest.fn(() => []),
  useLocalParticipant: jest.fn(() => ({
    localParticipant: {
      identity: 'test-user',
      setMicrophoneEnabled: jest.fn(),
    },
    isMicrophoneEnabled: true,
  })),
  useConnectionState: jest.fn(() => 'connected'),
  AudioSession: {
    startAudioSession: jest.fn(),
    stopAudioSession: jest.fn(),
  },
  registerGlobals: jest.fn(),
  ConnectionState: {
    Connected: 'connected',
    Connecting: 'connecting',
    Disconnected: 'disconnected',
    Reconnecting: 'reconnecting',
  },
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: {
        roomName: 'test-room',
        participantName: 'test-user',
        token: 'mock-token',
      },
    }),
  };
});
