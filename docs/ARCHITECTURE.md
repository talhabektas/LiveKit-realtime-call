# VoIP Demo — Mimari & Prodüksiyon Rehberi

## İçindekiler
1. [Bu Demo Nedir?](#bu-demo-nedir)
2. [Kullanılan Teknolojiler](#kullanılan-teknolojiler)
3. [Proje Yapısı](#proje-yapısı)
4. [Nasıl Çalışır?](#nasıl-çalışır)
5. [Demo'daki Eksikler](#demodaki-eksikler)
6. [Prodüksiyon Mimarisi (Next.js)](#prodüksiyon-mimarisi-nextjs)
7. [Adım Adım Prodüksiyon Geçişi](#adım-adım-prodüksiyon-geçişi)
8. [Tenant İzolasyonu](#tenant-izolasyonu)
9. [Görüntülü Aramaya Geçiş](#görüntülü-aramaya-geçiş)
10. [Gelen Arama Bildirimleri](#gelen-arama-bildirimleri)
11. [Paket Sürümleri](#paket-sürümleri)

---

## Bu Demo Nedir?

Bu proje, iOS mobil uygulamalarda **uygulama içi sesli arama** yapmanın nasıl çalıştığını gösteren bir demo uygulamasıdır. PagerDuty veya alerting sistemleri gibi uygulamalarda, tenant kullanıcılarının birbirleriyle sesli/görüntülü iletişim kurabilmesi için gereken altyapıyı göstermektedir.

**Demo'nun amacı:**
- LiveKit'in React Native entegrasyonunun nasıl yapıldığını anlamak
- WebRTC'nin iOS'ta nasıl çalıştığını görmek
- Prodüksiyon entegrasyonu için temel oluşturmak

---

## Kullanılan Teknolojiler

### LiveKit
Açık kaynaklı, WebRTC tabanlı gerçek zamanlı ses/video altyapısı. Twilio, Agora gibi servislerden farklı olarak:
- Self-host edilebilir
- Açık kaynak
- Fiyatlandırma daha uygun
- React Native için resmi SDK var

LiveKit Cloud adresi: `livekit.io`  
Demo sunucusu: `wss://mobileapp-jcf459h9.livekit.cloud`

### Expo SDK 53
React Native'i kolaylaştıran framework. Native build almak için `expo-dev-client` kullanılıyor (Expo Go değil, çünkü LiveKit native modül gerektiriyor).

### WebRTC
Tarayıcılar ve mobil uygulamalar arasında peer-to-peer ses/video iletişimini sağlayan açık protokol. LiveKit bu protokolü yönetiyor, bizim WebRTC'yi doğrudan kullanmamıza gerek yok.

### Hermes JS Engine
Facebook'un React Native için geliştirdiği optimize edilmiş JavaScript motoru. Daha hızlı başlangıç süresi sağlar.

---

## Proje Yapısı

```
mobileappitoc/
├── index.js                    # Uygulama giriş noktası — polyfill'ler burada
├── App.tsx                     # Navigator kurulumu
├── app.json                    # Expo konfigürasyonu (bundle ID, izinler)
├── .env                        # LiveKit credentials (prod'da backend'e taşınacak)
├── ios/                        # Native iOS kodu (Xcode projesi)
│   ├── Podfile                 # iOS bağımlılıkları (CocoaPods)
│   └── Podfile.properties.json # JS engine seçimi (hermes)
└── src/
    ├── screens/
    │   ├── HomeScreen.tsx       # Oda adı + kullanıcı adı giriş ekranı
    │   └── RoomScreen.tsx       # Aktif arama ekranı
    ├── utils/
    │   └── tokenGenerator.ts   # JWT token üretici (SADECE DEMO — prod'da backend'e taşı)
    └── types/
        └── navigation.ts        # TypeScript navigation tipleri
```

---

## Nasıl Çalışır?

### 1. Token Üretimi
LiveKit'e bağlanmak için JWT token gerekir. Token şu bilgileri içerir:
- Kim bağlanıyor (`sub`: kullanıcı adı)
- Hangi odaya (`video.room`)
- Ne yapabilir (`canPublish`, `canSubscribe`)
- Ne zaman expire olacak (`exp`)
- Kim imzaladı (`iss`: API key)

Token, API secret ile HMAC-SHA256 algoritması kullanılarak imzalanır.

```
Header.Payload.Signature  →  eyJhbGci...
```

### 2. Bağlantı Akışı

```
Kullanıcı "Odaya Katıl" basar
    ↓
tokenGenerator.ts → JWT üretir (API key + secret ile imzalanır)
    ↓
RoomScreen açılır
    ↓
LiveKitRoom bileşeni → wss://mobileapp-jcf459h9.livekit.cloud'a bağlanır
    ↓
AudioSession başlar (iOS mikrofon)
    ↓
Odadaki diğer katılımcılar listelenir
    ↓
Ses iletişimi başlar
```

### 3. Ses Akışı

```
Mikrofon → WebRTC → LiveKit Server → WebRTC → Karşı taraf hoparlörü
```

LiveKit sunucu peer-to-peer bağlantıyı yönetir. NAT arkasındaki cihazlar için TURN/STUN sunucularını otomatik kullanır.

### 4. Polyfill Neden Gerekti?

`index.js` dosyasında üç kritik adım var:

```js
// 1. DOMException polyfill
// Hermes'te DOMException global tanımlı değil.
// WebRTC modülü bunu kullandığı için başlamadan önce tanımlanması gerekiyor.
global.DOMException = ...

// 2. navigator.userAgent polyfill  
// livekit-client, platform tespiti için navigator.userAgent kullanıyor.
// React Native'de bu tanımlı değil.
global.navigator.userAgent = 'react-native'

// 3. registerGlobals() — import sırasından ÖNCE çağrılmalı
// livekit-client modülü yüklenirken WebRTC globallerini kullanıyor.
// App.tsx'te çağırsak geç kalırdı (ES module hoisting).
require('@livekit/react-native-webrtc').registerGlobals()

// 4. Uygulamayı yükle
require('expo/AppEntry')
```

---

## Demo'daki Eksikler

Bunlar demo'yu basit tutmak için kasıtlı olarak yapılmadı. Prod'da hepsi olmalı:

| Eksik | Risk | Prod Çözümü |
|-------|------|-------------|
| Token client'ta üretiliyor | API secret bundle'a gömülü, herkes görebilir | Backend endpoint'i |
| Gelen arama bildirimi yok | Kullanıcı aramadan haberdar olamaz | PushKit + APNs |
| Kullanıcı kimlik doğrulaması yok | Herkes herhangi bir odaya girebilir | JWT auth middleware |
| Oda yönetimi yok | Oda oluşturma/silme kontrolsüz | LiveKit Server API |
| Hata yönetimi minimal | Bağlantı kesilince kullanıcı bilgilendirilmiyor | Retry logic + UI |
| Sadece iOS | Android desteği yok | Android native build |

---

## Prodüksiyon Mimarisi (Next.js)

### Genel Mimari

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Mobile App    │     │  Next.js API    │     │  LiveKit Cloud  │
│  (React Native) │────▶│  (Backend)      │────▶│  (WebRTC Infra) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │   Database      │
         │              │  (kullanıcılar, │
         │              │   odalar, log)  │
         │              └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Push Service   │
│  (APNs/FCM)     │
└─────────────────┘
```

### Token API Endpoint'i

Next.js'te `app/api/livekit/token/route.ts` olarak:

```typescript
import { AccessToken } from 'livekit-server-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function POST(req: NextRequest) {
  // 1. Kullanıcı oturumu doğrula
  const session = await getServerSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Request body'yi al
  const { roomName, participantName } = await req.json()

  // 3. Kullanıcının bu odaya girebileceğini kontrol et
  // (tenant izolasyonu burada yapılır)
  const canJoin = await checkRoomAccess(session.user.id, roomName)
  if (!canJoin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 4. Token üret (secret SADECE server'da)
  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity: participantName,
      ttl: '1h',
    }
  )
  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  })

  return NextResponse.json({ token: await token.toJwt() })
}
```

**Gerekli paket (Next.js tarafı):**
```bash
npm install livekit-server-sdk
```

### Mobil Tarafta Token Alma

`tokenGenerator.ts` yerine backend'e istek atılır:

```typescript
// src/utils/tokenGenerator.ts (prod versiyonu)
export async function fetchToken(
  roomName: string,
  participantName: string
): Promise<string> {
  const res = await fetch('https://yourdomain.com/api/livekit/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userAuthToken}`, // mevcut kullanıcı token'ı
    },
    body: JSON.stringify({ roomName, participantName }),
  })

  if (!res.ok) throw new Error('Token alınamadı')
  const { token } = await res.json()
  return token
}
```

### Environment Variables

**Next.js (.env.local):**
```env
LIVEKIT_API_KEY=APIxxxxxx
LIVEKIT_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LIVEKIT_URL=wss://your-project.livekit.cloud
```

**Mobil (.env):**
```env
EXPO_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
# API_KEY ve API_SECRET artık burada YOK
```

---

## Adım Adım Prodüksiyon Geçişi

### Adım 1 — livekit-server-sdk'yı Next.js'e ekle
```bash
npm install livekit-server-sdk
```

### Adım 2 — Token endpoint'ini oluştur
`app/api/livekit/token/route.ts` — yukarıdaki örneği kullan.

### Adım 3 — Mobil'de tokenGenerator.ts'i güncelle
Client-side JWT üretimini kaldır, backend'e istek at.

### Adım 4 — .env dosyasını temizle
Mobil `.env`'den `EXPO_PUBLIC_LIVEKIT_API_KEY` ve `EXPO_PUBLIC_LIVEKIT_API_SECRET`'i sil.

### Adım 5 — Oda isimlendirme kuralı koy
```
{tenantId}-{callType}-{uuid}
// örn: tenant_abc123-voice-550e8400
```

### Adım 6 — Arama başlatma akışı
```
Kullanıcı A "Ara" basar
    → Backend'e POST /api/calls { calleeId, roomName }
    → Backend: oda oluştur, token üret, B'ye push notification gönder
    → A: token alır, LiveKit'e bağlanır
    → B: bildirimi alır, "Kabul Et" basar
    → B: token ister, LiveKit'e bağlanır
    → İkisi aynı odada buluşur
```

### Adım 7 — Push notification (gelen arama)
Aşağıdaki bölüme bak.

---

## Tenant İzolasyonu

Her tenant'ın aramaları birbirinden izole olmalı:

```typescript
// Oda adı oluşturma
function createRoomName(tenantId: string, callId: string): string {
  return `${tenantId}-${callId}`
}

// Backend'de erişim kontrolü
async function checkRoomAccess(userId: string, roomName: string): Promise<boolean> {
  const tenantId = roomName.split('-')[0]
  const user = await db.user.findUnique({ where: { id: userId } })
  return user?.tenantId === tenantId
}
```

LiveKit Cloud'da her proje zaten izole. Ek olarak oda adı naming convention ile tenant sınırı çizilir.

---

## Görüntülü Aramaya Geçiş

Mevcut demoda sadece ses var. Görüntü eklemek için:

### app.json
```json
{
  "expo": {
    "plugins": [
      [
        "@livekit/react-native-expo-plugin",
        {
          "cameraPermission": true,
          "microphonePermission": "Sesli/görüntülü arama için gereklidir."
        }
      ]
    ]
  }
}
```

### RoomScreen.tsx
```tsx
// Mevcut
<LiveKitRoom audio={true} ...>

// Görüntülü için
<LiveKitRoom audio={true} video={true} ...>
```

Video track'i göstermek için `VideoView` bileşeni eklenir:
```tsx
import { VideoView, useVideoTrack } from '@livekit/react-native'

// Her katılımcı için
<VideoView track={participant.videoTrack} />
```

**Not:** iOS'ta kamera izni için `NSCameraUsageDescription` da `app.json`'a eklenmeli.

---

## Gelen Arama Bildirimleri

Bu en kritik prod gereksinimidir. Kullanıcı uygulamayı kapatmışken bile bildirim alabilmesi için:

### iOS — PushKit (VoIP Push)

Normal push notification değil, **VoIP Push** kullanılmalı. Farkları:
- Uygulama kapalıyken bile tetikler
- Sistem "gelen arama" ekranını gösterir (CallKit)
- iOS tarafından özel işlenir

**Gerekli paketler:**
```bash
# React Native tarafı
npm install @react-native-community/push-notification-ios
npm install react-native-callkit  # Gelen arama UI'ı için
```

**Akış:**
```
Backend → APNs (Apple Push Notification Service) → Kullanıcının iPhone'u
    → PushKit tetiklenir
    → Uygulama arka planda açılır
    → CallKit "Gelen Arama" ekranı gösterilir
    → Kullanıcı kabul ederse LiveKit'e bağlanır
```

**Backend (Next.js):**
```typescript
import apn from '@parse/node-apn'

const provider = new apn.VoipProvider({
  cert: process.env.APN_CERT,
  key: process.env.APN_KEY,
})

await provider.send(notification, deviceToken)
```

---

## Paket Sürümleri

### Mobil (React Native)

| Paket | Sürüm | Açıklama |
|-------|-------|----------|
| `expo` | `~53.0.0` | Expo SDK |
| `react-native` | `0.79.6` | React Native |
| `react` | `19.0.0` | React |
| `@livekit/react-native` | `^2.4.0` (yüklü: 2.10.0) | LiveKit RN SDK |
| `@livekit/react-native-webrtc` | `^144.0.0` | WebRTC native modül |
| `@livekit/react-native-expo-plugin` | `^1.0.0` | Expo config plugin |
| `livekit-client` | `^2.5.0` (yüklü: 2.18.2) | LiveKit web client |
| `@react-navigation/native` | `^6.1.18` | Navigation |
| `@react-navigation/native-stack` | `^6.11.0` | Stack navigator |
| `expo-dev-client` | `~5.2.4` | Custom dev build |
| `react-native-screens` | `~4.11.1` | Native ekran yönetimi |
| `react-native-safe-area-context` | `5.4.0` | Safe area |
| `crypto-js` | `^4.2.0` | JWT imzalama (SADECE DEMO) |
| `typescript` | `~5.8.3` | TypeScript |

### Prod'da Eklenecekler (Mobil)

| Paket | Açıklama |
|-------|----------|
| `react-native-callkit` | Gelen arama UI |
| `@react-native-community/push-notification-ios` | Push notification |

### Next.js Backend

| Paket | Açıklama |
|-------|----------|
| `livekit-server-sdk` | Token üretimi ve oda yönetimi |
| `@parse/node-apn` | iOS VoIP push notification |

### Versiyon Uyumluluk Notu

`@livekit/react-native` v2.10.0 şu peer dependency'leri zorunlu tutuyor:
```
@livekit/react-native-webrtc: ^144.0.0  ← 125.x ile ÇALIŞMIYOR
livekit-client: ^2.15.8
```

Package.json'da `^2.4.0` yazdığında npm `2.10.0` kurar. Bu nedenle `webrtc` paketini de `^144.0.0` olarak belirtmek gerekiyor.

---

## Özet

Bu demo, prodüksiyon entegrasyonunun tüm teknik temellerini içeriyor. Prodda yapılacak tek fark:

1. **Token üretimi backend'e taşınır** (güvenlik)
2. **Push notification eklenir** (gelen arama)
3. **Tenant izolasyonu** oda isimlendirmesiyle sağlanır
4. **CallKit entegrasyonu** ile native gelen arama ekranı gösterilir

LiveKit altyapısı, ölçeklenebilirlik, düşük gecikme ve güvenilirlik açısından production-ready.
