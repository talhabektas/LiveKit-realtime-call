import { generateToken } from '../tokenGenerator';

// Mock env variables
beforeAll(() => {
  process.env.EXPO_PUBLIC_LIVEKIT_API_KEY = 'APItest123';
  process.env.EXPO_PUBLIC_LIVEKIT_API_SECRET = 'testsecret456';
});

describe('generateToken', () => {
  it('3 parçalı JWT string döner', () => {
    const token = generateToken('test-room', 'alice');
    const parts = token.split('.');
    expect(parts).toHaveLength(3);
  });

  it('header base64url ile decode edilebilir ve alg HS256 olmalı', () => {
    const token = generateToken('test-room', 'alice');
    const [headerB64] = token.split('.');
    // base64url → base64
    const padded = (headerB64 + '===').slice(0, headerB64.length + (4 - (headerB64.length % 4)) % 4).replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(padded));
    expect(decoded.alg).toBe('HS256');
    expect(decoded.typ).toBe('JWT');
  });

  it('payload içinde roomJoin grant ve doğru room adı var', () => {
    const token = generateToken('my-room', 'bob');
    const [, payloadB64] = token.split('.');
    const padded = (payloadB64 + '===').slice(0, payloadB64.length + (4 - (payloadB64.length % 4)) % 4).replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(padded));
    expect(decoded.video.roomJoin).toBe(true);
    expect(decoded.video.room).toBe('my-room');
    expect(decoded.sub).toBe('bob');
    expect(decoded.iss).toBe('APItest123');
  });

  it('API key veya secret eksikse hata fırlatır', () => {
    const key = process.env.EXPO_PUBLIC_LIVEKIT_API_KEY;
    process.env.EXPO_PUBLIC_LIVEKIT_API_KEY = '';
    expect(() => generateToken('room', 'user')).toThrow();
    process.env.EXPO_PUBLIC_LIVEKIT_API_KEY = key;
  });

  it('roomName veya participantName boşsa hata fırlatır', () => {
    expect(() => generateToken('', 'alice')).toThrow();
    expect(() => generateToken('room', '')).toThrow();
  });
});
