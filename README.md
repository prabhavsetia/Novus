# Novus

A mobile-first PWA for daily task planning, recurring routines, and AI-assisted scheduling. Built as a personal productivity tool during a data analyst career transition.

![Novus screenshots](https://img.shields.io/badge/PWA-installable-8b1e30) ![React](https://img.shields.io/badge/React-18-8b1e30) ![Vite](https://img.shields.io/badge/Vite-5-8b1e30) ![Firebase](https://img.shields.io/badge/Firebase-Firestore-8b1e30) ![Gemini](https://img.shields.io/badge/AI-Gemini-8b1e30)

## Features

- **Daily timetable** — add tasks with start (and optional end) times, check them off as you go
- **Week strip** — plan today and the rest of the current week in one view; past days auto-hide
- **Recurring templates** — set up weekday or weekend routines that auto-populate matching days
- **Long-term goals** — track multi-week objectives with descriptions and target dates
- **Progress chart** — daily completion rate line graph, weekly average, week-over-week delta, streak counter, collapsible history
- **AI assistant** — chat with Gemini that knows your goals, templates, today's tasks, and recent completion; suggests tasks you can add with one tap
- **PWA** — installable on iPhone home screen, works offline, real-time cloud sync across devices
- **Passcode lock** — simple 6-digit PIN entry, session persists in localStorage

## Design

Editorial "Refined Journal" aesthetic — warm ivory background with subtle grain texture, deep maroon accents, Instrument Serif headings paired with DM Sans body text. Mobile-first with a responsive desktop layout that swaps the bottom nav for a left side rail on tablets and laptops.

## Tech Stack

- React 18 · Vite · React Router
- Tailwind CSS
- Firebase Firestore (real-time sync via `onSnapshot`) + anonymous auth
- Recharts (completion chart)
- react-swipeable (swipe-to-reschedule)
- @google/generative-ai (Gemini)
- vite-plugin-pwa (service worker, offline cache)

## Getting Started

```bash
git clone <this-repo>
cd novus
npm install
cp .env.example .env.local
# Fill in your Firebase + Gemini keys in .env.local (see below)
npm run dev
```

Open the URL Vite prints and enter the PIN you set in `.env.local`.

## Configuration

All environment variables are read from `.env.local` (gitignored). Use `.env.example` as a template.

| Variable | Description |
| --- | --- |
| `VITE_APP_PASSCODE` | 6-digit PIN you'll type at the lock screen |
| `VITE_FIREBASE_API_KEY` | From Firebase console → Project Settings → Web app |
| `VITE_FIREBASE_AUTH_DOMAIN` | Same source |
| `VITE_FIREBASE_PROJECT_ID` | Same source |
| `VITE_FIREBASE_STORAGE_BUCKET` | Same source |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Same source |
| `VITE_FIREBASE_APP_ID` | Same source |
| `VITE_GEMINI_API_KEY` | From [Google AI Studio](https://aistudio.google.com/app/apikey) |

### Firebase project setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add a Web app and copy the `firebaseConfig` values into `.env.local`
3. Enable **Firestore Database** (production mode)
4. Enable **Authentication → Anonymous** sign-in
5. In **Firestore → Rules**, paste the contents of [`firestore.rules`](./firestore.rules) and publish

### Gemini setup

Get an API key from [Google AI Studio](https://aistudio.google.com/app/apikey) and add it as `VITE_GEMINI_API_KEY`.

> The Gemini key is exposed to the browser, which is acceptable for a single-user app behind a passcode. In a multi-user context, proxy requests through a server.

## Deployment

Deployed on Vercel:

1. Push this repo to GitHub
2. Import on [vercel.com](https://vercel.com) (auto-detects Vite)
3. Add all `VITE_*` variables in **Project Settings → Environment Variables**
4. Vercel rebuilds on every push to `main`

The included `vercel.json` handles SPA routing.

## Project Structure

```
src/
├── App.jsx              # Auth gate + routes
├── main.jsx             # React entry + router
├── firebase.js          # Firestore + anonymous auth setup
├── lib/                 # Date helpers, Gemini client, utilities
├── hooks/               # Firestore data subscriptions (tasks/templates/goals/chat)
├── components/
│   ├── ui/              # Button, Card, ProgressRing, Segmented, Spinner
│   ├── layout/          # AppShell, BottomNav, SideRail
│   ├── tasks/           # TaskRow, TaskList, AddTaskForm, DatePickerSheet
│   ├── week/            # WeekStrip
│   ├── templates/       # TemplateCard, TemplateForm
│   ├── goals/           # GoalCard, GoalForm
│   ├── progress/        # CompletionChart, StatCards, StreakBar, HistorySection
│   └── ai/              # ChatMessage, ChatInput, MemoryBar
└── screens/             # PasscodeScreen, TodayScreen, PlanScreen, ProgressScreen, AIScreen
```

## License

[MIT](./LICENSE) © Prabhav Setia
