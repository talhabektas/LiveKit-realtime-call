// Dışarıdan (LiveKit Cloud dashboard / lk CLI) üretilmiş bir JWT'yi sadece OKUR.
// Token burada İMZALANMAZ — API secret bu uygulamada yoktur. İmza doğrulaması
// LiveKit sunucusunda yapılır; biz yalnızca UI'da göstermek ve doğru odaya
// yönlendirmek için payload'daki room/identity bilgisini ayıklıyoruz.

export interface TokenInfo {
  room: string;
  identity: string;
}

interface LiveKitJwtPayload {
  sub?: string;
  video?: { room?: string };
}

const B64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// atob'a bağımlı olmayan, her JS runtime'ında (Hermes dahil) çalışan base64 decode.
// base64 string → ham byte değerlerinden oluşan "binary" string döner.
function decodeBase64(b64: string): string {
  const clean = b64.replace(/[^A-Za-z0-9+/]/g, '');
  let output = '';
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < clean.length; i++) {
    const value = B64_ALPHABET.indexOf(clean[i]);
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  return output;
}

// base64url segment → UTF-8 string (Türkçe karakterli identity'ler için güvenli)
function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const binary = decodeBase64(base64);
  return decodeURIComponent(
    binary
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  );
}

/** Yapıştırılan token'dan tüm boşluk/satır sonlarını temizler. */
export function sanitizeToken(raw: string): string {
  return raw.replace(/\s+/g, '');
}

/**
 * Yapıştırılan LiveKit token'ından oda adı ve identity'yi çıkarır.
 * Geçersiz token'da anlamlı bir hata fırlatır (UI bunu kullanıcıya gösterir).
 */
export function decodeToken(token: string): TokenInfo {
  const parts = sanitizeToken(token).split('.');
  if (parts.length !== 3) {
    throw new Error('Geçersiz token: 3 parçalı bir JWT bekleniyor');
  }

  let payload: LiveKitJwtPayload;
  try {
    payload = JSON.parse(base64UrlDecode(parts[1])) as LiveKitJwtPayload;
  } catch {
    throw new Error('Token çözümlenemedi — geçerli bir LiveKit token yapıştırın');
  }

  const room = payload.video?.room;
  const identity = payload.sub;
  if (!room || !identity) {
    throw new Error('Token içinde oda (video.room) veya identity (sub) yok');
  }

  return { room, identity };
}
