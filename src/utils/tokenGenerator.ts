import CryptoJS from 'crypto-js';

function base64UrlEncode(input: string): string {
  const encoded = encodeURIComponent(input).replace(
    /%([0-9A-F]{2})/g,
    (_, p1: string) => String.fromCharCode(parseInt(p1, 16)),
  );
  return btoa(encoded)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function generateToken(roomName: string, participantName: string): string {
  const apiKey = process.env.EXPO_PUBLIC_LIVEKIT_API_KEY ?? '';
  const apiSecret = process.env.EXPO_PUBLIC_LIVEKIT_API_SECRET ?? '';

  if (!apiKey || !apiSecret) {
    throw new Error(
      '.env dosyasında EXPO_PUBLIC_LIVEKIT_API_KEY ve EXPO_PUBLIC_LIVEKIT_API_SECRET eksik',
    );
  }

  if (!roomName || !participantName) {
    throw new Error('roomName ve participantName boş olamaz');
  }

  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    iss: apiKey,
    sub: participantName,
    exp: now + 3600,
    nbf: now - 60,
    jti: `${apiKey}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    video: {
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    },
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signature = CryptoJS.HmacSHA256(signingInput, apiSecret);
  const encodedSignature = CryptoJS.enc.Base64.stringify(signature)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${signingInput}.${encodedSignature}`;
}
