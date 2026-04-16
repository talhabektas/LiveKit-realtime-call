# VoIP Demo

A demo project showcasing how in-app voice calling works on iOS, built with [LiveKit](https://livekit.io) and React Native.

## What is this?

This project was built to explore the technical foundation of adding voice calling to a mobile application. Users can join a voice call by entering a room name and a username. Multiple participants can connect to the same room simultaneously.

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

Create a `.env` file:

```env
EXPO_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
EXPO_PUBLIC_LIVEKIT_API_KEY=your-api-key
EXPO_PUBLIC_LIVEKIT_API_SECRET=your-api-secret
```

Get your LiveKit credentials at [livekit.io](https://livekit.io).

## Running

```bash
npx expo run:ios
```

## Screens

**Home Screen** — Enter a room name and username to join a call.

**Room Screen** — View connected participants and control your microphone.

## Note

This is a demo project. JWT tokens are generated on the client side for simplicity — in a production environment, tokens should be issued by a backend server.
