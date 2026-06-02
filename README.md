# VoIP Demo

A demo project showcasing how in-app voice calling works on iOS, built with [LiveKit](https://livekit.io) and React Native.

## What is this?

This project was built to explore the technical foundation of adding voice calling to a mobile application. Users join a voice call by pasting a pre-generated LiveKit access token (which already encodes the room name and identity). Multiple participants can connect to the same room simultaneously.

## Features

- Voice calling via LiveKit / WebRTC
- Real-time participant list
- Mute / unmute microphone
- Multi-participant support

## Tech Stack

- [Expo](https://expo.dev) SDK 53
- [React Native](https://reactnative.dev) 0.79
- [LiveKit](https://livekit.io) — WebRTC infrastructure
- TypeScript

## Setup

```bash
npm install --legacy-peer-deps
```

Create a `.env` file (see `.env.example`):

```env
EXPO_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
# Optional: a default token to pre-fill the join screen. Leave empty to paste manually.
EXPO_PUBLIC_LIVEKIT_TOKEN=
```

> ⚠️ This app does **not** mint tokens, and the LiveKit **API secret never lives in
> the app bundle**. Generate short-lived access tokens externally — via the
> [LiveKit Cloud](https://livekit.io) dashboard or the LiveKit CLI
> (`lk token create ...`) — then paste them into the Home screen. Use a different
> token (different identity) for each device joining the same room.

## Running

```bash
npx expo run:ios
```

## Screens

**Home Screen** — Paste a LiveKit access token and join. The room and identity are read from the token.

**Room Screen** — View connected participants and control your microphone.

## Note

This is a demo/PoC. Tokens are minted **outside** the app (LiveKit Cloud dashboard or `lk token create`) and consumed here — the API secret is never bundled. In production, tokens will be issued by a backend (e.g. a Supabase Edge Function) after authenticating the user and authorizing room access.
