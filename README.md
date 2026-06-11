# MindFlow

A personal mobile app to manage daily tasks and get a bit of inspiration along the way. Built with Expo and React Native.

## Screens

- **Home** – Quick overview and shortcuts
- **Add** – Add a new task with title, description and urgency flag
- **Tasks** – Full task list with basic stats (done / pending / urgent)
- **Inspire** – A random quote fetched from a public API

## Stack

- Expo / React Native
- TypeScript
- expo-router (file-based routing)
- expo-sqlite (local storage on mobile, localStorage on web)
- react-native-reanimated

## Getting started

```bash
git clone https://github.com/Assaadbenz/MindFlow.git
cd MindFlow
npm install
npm start
```

Scan the QR code with Expo Go, or run `npm run android` / `npm run web`.

## Data

Tasks are stored locally on the device using SQLite (iOS/Android) or localStorage (web). No backend, no account needed.

## License

MIT
