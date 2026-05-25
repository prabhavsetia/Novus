# Novus

> v1.0 — A mobile-first PWA for personal daily task management. SQL/Python/Data Analyst study companion.

## Features
- Daily task list with times
- Week strip to plan ahead
- Recurring templates (weekday/weekend routines)
- Long-term goals
- Progress chart + streak + history
- Gemini AI assistant with memory

## Tech
React 18 · Vite · Tailwind · Firebase Firestore · Recharts · Gemini AI

## Setup
1. Copy `.env.example` to `.env.local` and fill in Firebase + Gemini keys
2. `npm install`
3. `npm run dev`

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Add a Web app, copy the config snippet
3. Enable **Firestore Database** (start in production mode)
4. Enable **Authentication → Anonymous** (Sign-in method tab)
5. In Firestore Rules tab, paste the contents of `firestore.rules` and publish
6. Copy values into `.env.local`:

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

## Gemini Setup

1. Get an API key at https://aistudio.google.com/app/apikey
2. Add to `.env.local`:

   ```
   VITE_GEMINI_API_KEY=...
   ```

> ⚠️ The Gemini API key is exposed to the browser. This is acceptable for a personal-use app
> behind a passcode wall, but in any multi-user context you'd proxy requests through a server.

## Deploy

1. Push to GitHub
2. Import the repo on https://vercel.com
3. Add all `VITE_*` env vars in the Vercel project settings
4. Vercel auto-builds on push
