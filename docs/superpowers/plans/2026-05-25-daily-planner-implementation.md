# Daily Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first PWA daily planner with task scheduling, recurring templates, goals, progress tracking, and a Gemini AI assistant with persistent memory.

**Architecture:** Single-page React app with React Router. Firebase Firestore for real-time data sync across devices. Gemini API for AI chat. All state derived from Firestore via `onSnapshot` listeners wrapped in custom hooks. Single Firestore document (`appState/default`) is not used — instead, four top-level collections: `tasks`, `templates`, `goals`, `chatMessages`. Component structure mirrors the 6 screens in the spec, with shared primitives in `components/ui/`.

**Tech Stack:** React 18, Vite, Tailwind CSS, Firebase Firestore, Recharts, react-swipeable, @google/generative-ai, react-router-dom, date-fns

**Commit style:** One commit per task (engineer's git workflow). Conventional commits format. NEVER use `--no-verify`. NEVER add `Co-Authored-By` lines to commit messages.

---

## File Structure

```
weekly-planner/
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── icon-192.png               # PWA icon (placeholder)
│   ├── icon-512.png               # PWA icon (placeholder)
│   └── apple-touch-icon.png       # iOS home screen icon
├── src/
│   ├── main.jsx                   # React entry, router setup
│   ├── App.jsx                    # Root component with auth gate
│   ├── index.css                  # Tailwind + global styles (fonts, grain texture)
│   ├── firebase.js                # Firebase init, exports `db`
│   ├── lib/
│   │   ├── dates.js               # Date helpers (today, week range, format)
│   │   ├── gemini.js              # Gemini client init and chat function
│   │   └── classnames.js          # Tiny cn() utility for conditional classes
│   ├── hooks/
│   │   ├── useAuth.js             # Passcode auth state via localStorage
│   │   ├── useTasks.js            # Tasks Firestore subscription + CRUD
│   │   ├── useTemplates.js        # Templates Firestore subscription + CRUD
│   │   ├── useGoals.js            # Goals Firestore subscription + CRUD
│   │   ├── useChat.js             # Chat messages subscription + send
│   │   └── useTemplatePopulator.js # Auto-populates tasks from templates on day load
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.jsx         # Primary maroon button + ghost variant
│   │   │   ├── Card.jsx           # White card with border + shadow
│   │   │   ├── Segmented.jsx      # Segmented control (Templates | Goals)
│   │   │   ├── ProgressRing.jsx   # SVG progress ring
│   │   │   └── Spinner.jsx        # Loading spinner
│   │   ├── layout/
│   │   │   ├── AppShell.jsx       # Phone-width container + bottom nav
│   │   │   └── BottomNav.jsx      # 4-tab bottom navigation
│   │   ├── tasks/
│   │   │   ├── TaskRow.jsx        # Swipeable task row with checkbox
│   │   │   ├── TaskList.jsx       # List of TaskRow grouped/sorted by time
│   │   │   ├── AddTaskForm.jsx    # Modal form to create a task
│   │   │   └── DatePickerSheet.jsx # Bottom sheet date picker for reschedule
│   │   ├── week/
│   │   │   └── WeekStrip.jsx      # 7-day pill strip (past hidden)
│   │   ├── templates/
│   │   │   ├── TemplateCard.jsx   # Template preview card
│   │   │   └── TemplateForm.jsx   # Create/edit template
│   │   ├── goals/
│   │   │   ├── GoalCard.jsx       # Goal preview card
│   │   │   └── GoalForm.jsx       # Create/edit goal
│   │   ├── progress/
│   │   │   ├── CompletionChart.jsx # Recharts line chart
│   │   │   ├── StatCards.jsx      # Week % + vs last week
│   │   │   ├── StreakBar.jsx      # Fire streak indicator
│   │   │   └── HistorySection.jsx # Collapsible past-day list
│   │   └── ai/
│   │       ├── ChatMessage.jsx    # Message bubble + inline suggestions
│   │       ├── ChatInput.jsx      # Text input + send button
│   │       └── MemoryBar.jsx      # Chips showing what AI knows
│   └── screens/
│       ├── PasscodeScreen.jsx     # 6-digit PIN entry
│       ├── TodayScreen.jsx        # Week strip + task list for selected day
│       ├── PlanScreen.jsx         # Templates | Goals tabs
│       ├── ProgressScreen.jsx     # Chart + stats + history
│       └── AIScreen.jsx           # Chat with Gemini
├── docs/superpowers/specs/2026-05-25-daily-planner-design.md
├── docs/superpowers/plans/2026-05-25-daily-planner-implementation.md
├── .env.local                     # Firebase + Gemini env vars (gitignored)
├── .env.example                   # Template with placeholder values
├── .gitignore
├── index.html                     # Vite entry HTML with PWA meta tags
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js                 # PWA plugin config
└── README.md
```

---

## Phase 1: Project Foundation

### Task 1: Initialize the Vite + React project

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/index.css`, `.gitignore`, `README.md`

- [ ] **Step 1: Initialize git repo and create Vite project**

```bash
cd /Users/prabhavsetia/Documents/dev/devyani/weekly-planner
git init
npm create vite@latest . -- --template react
```

When prompted "Current directory is not empty. Remove existing files and continue?" — choose **Ignore files and continue**.

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install react-router-dom firebase recharts react-swipeable @google/generative-ai date-fns
npm install -D tailwindcss@3 postcss autoprefixer vite-plugin-pwa
```

- [ ] **Step 3: Initialize Tailwind**

```bash
npx tailwindcss init -p
```

- [ ] **Step 4: Configure Tailwind (`tailwind.config.js`)**

Replace contents with:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#faf8f6',
        'ivory-2': '#f5f0ec',
        'ivory-3': '#f0ebe6',
        maroon: {
          DEFAULT: '#8b1e30',
          dark: '#6e1526',
          deep: '#7a1a2e',
        },
        ink: '#2a2020',
        mute: '#a09088',
        mute2: '#c0b8b0',
        line: '#e0d8d2',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: Replace `src/index.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body, #root {
    height: 100%;
  }
  body {
    @apply bg-ivory-2 text-ink font-sans antialiased;
    -webkit-tap-highlight-color: transparent;
  }
  /* subtle paper grain overlay */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.02'/%3E%3C/svg%3E");
  }
}

@layer utilities {
  .tabular { font-variant-numeric: tabular-nums; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
}
```

- [ ] **Step 6: Replace `src/App.jsx`** with placeholder

```jsx
export default function App() {
  return (
    <div className="min-h-full flex items-center justify-center">
      <h1 className="font-serif text-4xl text-maroon">Daily Planner</h1>
    </div>
  )
}
```

- [ ] **Step 7: Replace `index.html`** with PWA-friendly meta tags

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#8b1e30" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Planner" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <title>Daily Planner</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Replace `README.md`**

```markdown
# Daily Planner

A mobile-first PWA for personal daily task management. SQL/Python/Data Analyst study companion.

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
```

- [ ] **Step 9: Verify dev server runs**

Run: `npm run dev`
Expected: Vite prints a local URL (e.g. http://localhost:5173). Open it — should see "Daily Planner" in maroon serif on a warm ivory background with a subtle grain texture. Stop with Ctrl+C.

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "chore: initialize Vite + React + Tailwind project"
```

---

### Task 2: Firebase setup and env scaffolding

**Files:**
- Create: `src/firebase.js`, `.env.local`, `.env.example`

- [ ] **Step 1: Create `.env.example`**

```
VITE_APP_PASSCODE=000000
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GEMINI_API_KEY=
```

- [ ] **Step 2: Create `.env.local`** (user fills real values later, gitignored)

```
VITE_APP_PASSCODE=000000
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GEMINI_API_KEY=
```

- [ ] **Step 3: Ensure `.gitignore` excludes env files**

Append to `.gitignore` if not already present:

```
.env.local
.env*.local
```

- [ ] **Step 4: Create `src/firebase.js`**

```js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(config)
export const db = getFirestore(app)
```

- [ ] **Step 5: Verify build doesn't break with empty env**

Run: `npm run build`
Expected: build completes without errors (Firebase init does not throw when called; it would only throw when actually used).

- [ ] **Step 6: Commit**

```bash
git add .env.example .gitignore src/firebase.js
git commit -m "feat: add Firebase setup and env scaffolding"
```

---

### Task 3: Date utilities and classname helper

**Files:**
- Create: `src/lib/dates.js`, `src/lib/classnames.js`

- [ ] **Step 1: Create `src/lib/classnames.js`**

```js
export function cn(...args) {
  return args.filter(Boolean).join(' ')
}
```

- [ ] **Step 2: Create `src/lib/dates.js`**

```js
import {
  format, startOfWeek, addDays, isToday, isBefore, startOfDay,
  parseISO, differenceInCalendarDays
} from 'date-fns'

export const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export function todayISO() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function isoFromDate(date) {
  return format(date, 'yyyy-MM-dd')
}

export function dateFromISO(iso) {
  return parseISO(iso)
}

// Returns an array of 7 Date objects starting Monday of the week containing `date`
export function weekDays(date = new Date()) {
  const monday = startOfWeek(date, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

export function dayKey(date) {
  return DAY_KEYS[date.getDay()]
}

export function isPastDay(date) {
  return isBefore(startOfDay(date), startOfDay(new Date()))
}

export function isTodayDate(date) {
  return isToday(date)
}

export function formatHeaderDate(date) {
  return format(date, 'MMM d')
}

export function formatDayName(date) {
  return format(date, 'EEEE')
}

export function formatShortDay(date) {
  return format(date, 'EEE')
}

export function formatDayNum(date) {
  return format(date, 'd')
}

// Returns last N ISO dates ending today (inclusive), oldest first
export function lastNDays(n, end = new Date()) {
  return Array.from({ length: n }, (_, i) =>
    isoFromDate(addDays(end, -(n - 1 - i)))
  )
}

// Add N days (positive or negative) to an ISO date, return ISO
export function addDaysISO(iso, days) {
  return isoFromDate(addDays(parseISO(iso), days))
}

// Format HH:mm 24hr → human display, e.g. "07:00" → "7:00 AM"
export function formatTime12(hhmm) {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = ((h + 11) % 12) + 1
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

// Sort tasks by their HH:mm time string ascending
export function compareByTime(a, b) {
  return (a.time || '').localeCompare(b.time || '')
}

export function daysBetween(isoA, isoB) {
  return differenceInCalendarDays(parseISO(isoA), parseISO(isoB))
}
```

- [ ] **Step 3: Quick sanity check in the browser console** (skip if no dev server running)

Open `npm run dev`, in browser console type:
```js
const m = await import('/src/lib/dates.js')
m.todayISO()
```
Expected: returns today's date in YYYY-MM-DD format.

- [ ] **Step 4: Commit**

```bash
git add src/lib/
git commit -m "feat: add date utilities and classname helper"
```

---

### Task 4: UI primitives — Button, Card, Spinner

**Files:**
- Create: `src/components/ui/Button.jsx`, `src/components/ui/Card.jsx`, `src/components/ui/Spinner.jsx`

- [ ] **Step 1: Create `src/components/ui/Button.jsx`**

```jsx
import { cn } from '../../lib/classnames'

export default function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition active:scale-[0.98] select-none'
  const sizes = 'px-5 py-3 text-sm'
  const variants = {
    primary: 'bg-gradient-to-br from-maroon to-maroon-dark text-white shadow-[0_4px_14px_rgba(139,30,48,0.2)]',
    ghost: 'bg-transparent text-mute hover:text-ink',
    tonal: 'bg-maroon/10 text-maroon-deep border border-maroon/10',
  }
  return (
    <button
      type={type}
      className={cn(base, sizes, variants[variant], className)}
      {...props}
    />
  )
}
```

- [ ] **Step 2: Create `src/components/ui/Card.jsx`**

```jsx
import { cn } from '../../lib/classnames'

export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={cn(
        'bg-white border border-black/5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/ui/Spinner.jsx`**

```jsx
export default function Spinner({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="animate-spin text-maroon"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" opacity="0.2" />
      <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
    </svg>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add UI primitives (Button, Card, Spinner)"
```

---


## Phase 2: Auth, Layout, Navigation

### Task 5: Passcode auth hook

**Files:**
- Create: `src/hooks/useAuth.js`

- [ ] **Step 1: Create `src/hooks/useAuth.js`**

```js
import { useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'planner.auth'

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const { ok, ts } = JSON.parse(raw)
    if (!ok) return false
    // Session never expires automatically; user can clear localStorage to log out.
    return true
  } catch {
    return false
  }
}

export function useAuth() {
  const [authed, setAuthed] = useState(() => readStored())

  const tryUnlock = useCallback((pin) => {
    const expected = import.meta.env.VITE_APP_PASSCODE
    if (pin === expected) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ok: true, ts: Date.now() })
      )
      setAuthed(true)
      return true
    }
    return false
  }, [])

  const lock = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAuthed(false)
  }, [])

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setAuthed(readStored())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return { authed, tryUnlock, lock }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useAuth.js
git commit -m "feat: add passcode auth hook with localStorage"
```

---

### Task 6: Passcode screen

**Files:**
- Create: `src/screens/PasscodeScreen.jsx`

- [ ] **Step 1: Create `src/screens/PasscodeScreen.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { cn } from '../lib/classnames'

const KEYS = ['1','2','3','4','5','6','7','8','9','',  '0','del']

export default function PasscodeScreen({ onSubmit }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  function press(k) {
    setError(false)
    if (k === 'del') {
      setPin((p) => p.slice(0, -1))
      return
    }
    if (k === '' ) return
    setPin((p) => (p.length >= 6 ? p : p + k))
  }

  useEffect(() => {
    if (pin.length === 6) {
      const ok = onSubmit(pin)
      if (!ok) {
        setError(true)
        setTimeout(() => setPin(''), 400)
      }
    }
  }, [pin, onSubmit])

  // Hardware keyboard support
  useEffect(() => {
    function onKey(e) {
      if (/^[0-9]$/.test(e.key)) press(e.key)
      else if (e.key === 'Backspace') press('del')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-8 py-12">
      <h1 className="font-serif text-3xl text-maroon-deep mb-2">Daily Planner</h1>
      <p className="text-mute text-sm mb-10 tracking-wide">Enter your PIN to continue</p>

      <div className={cn('flex gap-3 mb-12 transition', error && 'animate-pulse')}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-3.5 h-3.5 rounded-full border-[1.5px] transition',
              pin.length > i
                ? error
                  ? 'bg-red-500 border-red-500'
                  : 'bg-maroon border-maroon'
                : 'border-line'
            )}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((k, i) => (
          <button
            key={i}
            onClick={() => press(k)}
            disabled={k === ''}
            className={cn(
              'w-16 h-16 rounded-full text-xl text-ink',
              k === '' && 'opacity-0 pointer-events-none',
              k === 'del'
                ? 'bg-maroon/[0.06] border border-maroon/10 text-maroon text-base'
                : 'bg-ivory-3 border border-line active:bg-line'
            )}
          >
            {k === 'del' ? '⌫' : k}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire to App.jsx temporarily and test in browser**

Replace `src/App.jsx`:

```jsx
import { useAuth } from './hooks/useAuth'
import PasscodeScreen from './screens/PasscodeScreen'

export default function App() {
  const { authed, tryUnlock, lock } = useAuth()
  if (!authed) return <PasscodeScreen onSubmit={tryUnlock} />
  return (
    <div className="min-h-full flex flex-col items-center justify-center gap-4">
      <h1 className="font-serif text-4xl text-maroon">Unlocked</h1>
      <button onClick={lock} className="text-mute underline">Log out</button>
    </div>
  )
}
```

- [ ] **Step 3: Manual test**

Run `npm run dev`. Open in browser.
1. Type 6 wrong digits → dots should flash and clear.
2. Type your PIN from `.env.local` → should unlock and show "Unlocked".
3. Click "Log out" → should return to passcode screen.

- [ ] **Step 4: Commit**

```bash
git add src/screens/PasscodeScreen.jsx src/App.jsx
git commit -m "feat: add passcode screen with PIN entry"
```

---

### Task 7: App shell and bottom navigation

**Files:**
- Create: `src/components/layout/AppShell.jsx`, `src/components/layout/BottomNav.jsx`

- [ ] **Step 1: Create `src/components/layout/BottomNav.jsx`**

```jsx
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/classnames'

const ITEMS = [
  { to: '/', label: 'Today', icon: '◉', end: true },
  { to: '/plan', label: 'Plan', icon: '↻' },
  { to: '/progress', label: 'Progress', icon: '⟋' },
  { to: '/ai', label: 'AI', icon: '✦' },
]

export default function BottomNav() {
  return (
    <nav className="border-t border-black/5 bg-ivory grid grid-cols-4 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {ITEMS.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 py-1 text-[9px] uppercase tracking-[1.5px]',
              isActive ? 'text-maroon-deep' : 'text-mute2'
            )
          }
        >
          <span className="text-base leading-none">{it.icon}</span>
          {it.label}
        </NavLink>
      ))}
    </nav>
  )
}
```

- [ ] **Step 2: Create `src/components/layout/AppShell.jsx`**

```jsx
import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function AppShell() {
  return (
    <div className="min-h-full flex justify-center">
      <div className="w-full max-w-[480px] min-h-full flex flex-col bg-ivory shadow-[0_0_60px_rgba(0,0,0,0.04)]">
        <main className="flex-1 overflow-y-auto px-5 pt-[max(1rem,env(safe-area-inset-top))]">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Wire router in `src/main.jsx`**

Replace `src/main.jsx`:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

- [ ] **Step 4: Wire routes in `src/App.jsx`**

Replace with:

```jsx
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import PasscodeScreen from './screens/PasscodeScreen'
import AppShell from './components/layout/AppShell'

function Placeholder({ name }) {
  return (
    <div className="py-10 text-center">
      <h2 className="font-serif text-2xl text-ink">{name}</h2>
      <p className="text-mute text-sm mt-2">Coming soon</p>
    </div>
  )
}

export default function App() {
  const { authed, tryUnlock } = useAuth()
  if (!authed) return <PasscodeScreen onSubmit={tryUnlock} />
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Placeholder name="Today" />} />
        <Route path="plan" element={<Placeholder name="Plan" />} />
        <Route path="progress" element={<Placeholder name="Progress" />} />
        <Route path="ai" element={<Placeholder name="AI" />} />
      </Route>
    </Routes>
  )
}
```

- [ ] **Step 5: Manual test**

Run `npm run dev`. Unlock with PIN. Verify:
1. Bottom nav shows 4 tabs (Today, Plan, Progress, AI)
2. Tapping each tab navigates and highlights it in maroon
3. Content area is centered with phone-width on desktop

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/ src/main.jsx src/App.jsx
git commit -m "feat: add app shell and bottom navigation with routing"
```

---

## Phase 3: Tasks — Data Layer

### Task 8: useTasks hook (read + create)

**Files:**
- Create: `src/hooks/useTasks.js`

- [ ] **Step 1: Create `src/hooks/useTasks.js`**

```js
import { useEffect, useState, useCallback } from 'react'
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

const COL = 'tasks'

// Subscribe to tasks for a specific date (YYYY-MM-DD)
export function useTasksForDate(dateISO) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!dateISO) return
    setLoading(true)
    const q = query(collection(db, COL), where('date', '==', dateISO))
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      rows.sort((a, b) => (a.time || '').localeCompare(b.time || ''))
      setTasks(rows)
      setLoading(false)
    })
    return unsub
  }, [dateISO])

  return { tasks, loading }
}

// Subscribe to tasks across a range of dates (inclusive). Used by progress + history.
export function useTasksInRange(startISO, endISO) {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    if (!startISO || !endISO) return
    const q = query(
      collection(db, COL),
      where('date', '>=', startISO),
      where('date', '<=', endISO)
    )
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [startISO, endISO])

  return tasks
}

export function useTaskActions() {
  const createTask = useCallback(async ({ name, date, time, fromTemplate = null }) => {
    return addDoc(collection(db, COL), {
      name,
      date,
      time,
      completed: false,
      completedAt: null,
      fromTemplate,
      createdAt: serverTimestamp(),
    })
  }, [])

  const toggleComplete = useCallback(async (id, completed) => {
    await updateDoc(doc(db, COL, id), {
      completed,
      completedAt: completed ? serverTimestamp() : null,
    })
  }, [])

  const rescheduleTask = useCallback(async (id, newDateISO) => {
    await updateDoc(doc(db, COL, id), {
      date: newDateISO,
      completed: false,
      completedAt: null,
    })
  }, [])

  const deleteTask = useCallback(async (id) => {
    await deleteDoc(doc(db, COL, id))
  }, [])

  return { createTask, toggleComplete, rescheduleTask, deleteTask }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useTasks.js
git commit -m "feat: add useTasks hook with Firestore subscriptions"
```

---

### Task 9: TaskRow component with swipe-to-reschedule

**Files:**
- Create: `src/components/tasks/TaskRow.jsx`

- [ ] **Step 1: Create `src/components/tasks/TaskRow.jsx`**

```jsx
import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { cn } from '../../lib/classnames'
import { formatTime12 } from '../../lib/dates'

export default function TaskRow({
  task,
  isCurrent = false,
  onToggle,
  onReschedule, // (newISO) => void  — called when user picks tomorrow or a date
  onPickDate,   // () => void        — opens the date picker sheet
}) {
  const [revealed, setRevealed] = useState(false)

  const handlers = useSwipeable({
    onSwipedLeft: () => setRevealed(true),
    onSwipedRight: () => setRevealed(false),
    trackMouse: true,
    delta: 30,
  })

  const tomorrowISO = (() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  })()

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons revealed on swipe */}
      <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-1">
        <button
          onClick={() => { onReschedule(tomorrowISO); setRevealed(false) }}
          className="h-[calc(100%-12px)] my-1.5 px-3 rounded-lg text-[10px] font-semibold tracking-wider text-white bg-gradient-to-br from-maroon to-maroon-dark"
        >
          TMR
        </button>
        <button
          onClick={() => { onPickDate(); setRevealed(false) }}
          className="h-[calc(100%-12px)] my-1.5 px-3 rounded-lg text-[10px] font-semibold tracking-wider text-maroon-deep bg-maroon/10"
        >
          📅
        </button>
      </div>

      <div
        {...handlers}
        className={cn(
          'flex items-center gap-3 py-3 border-b border-black/[0.04] transition-transform bg-ivory',
          isCurrent && 'bg-maroon/[0.03] rounded-xl border-b-0 -mx-2 px-3 my-0.5',
        )}
        style={{ transform: revealed ? 'translateX(-120px)' : 'translateX(0)' }}
      >
        <button
          onClick={() => onToggle(!task.completed)}
          className={cn(
            'w-5 h-5 rounded-md border-[1.5px] flex-shrink-0 flex items-center justify-center transition',
            task.completed
              ? 'bg-gradient-to-br from-maroon to-maroon-dark border-maroon'
              : 'border-mute2'
          )}
        >
          {task.completed && <span className="text-white text-[10px] font-bold leading-none">✓</span>}
        </button>

        <div className="flex-1 min-w-0">
          <div className={cn(
            'text-sm leading-tight',
            task.completed ? 'text-mute2 line-through decoration-mute2' : 'text-ink'
          )}>
            {task.name}
          </div>
          {task.fromTemplate && (
            <div className="text-[10px] text-mute2 mt-0.5 tracking-wide flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-maroon" />
              template
            </div>
          )}
        </div>

        <div className={cn(
          'text-[11px] tabular flex-shrink-0',
          isCurrent ? 'text-maroon-deep font-medium' : 'text-mute'
        )}>
          {formatTime12(task.time)}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/tasks/TaskRow.jsx
git commit -m "feat: add swipeable TaskRow component"
```

---

### Task 10: TaskList component

**Files:**
- Create: `src/components/tasks/TaskList.jsx`

- [ ] **Step 1: Create `src/components/tasks/TaskList.jsx`**

```jsx
import { useMemo } from 'react'
import TaskRow from './TaskRow'

function findCurrentTaskIndex(tasks) {
  if (!tasks.length) return -1
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i]
    if (t.completed) continue
    if (!t.time) return i
    const [h, m] = t.time.split(':').map(Number)
    if (h * 60 + m >= nowMin) return i
  }
  // All upcoming are past times — highlight first incomplete
  return tasks.findIndex((t) => !t.completed)
}

export default function TaskList({
  tasks,
  isToday = false,
  onToggle,
  onReschedule,
  onPickDate,
  emptyText = 'No tasks yet for this day.',
}) {
  const currentIdx = useMemo(() => (isToday ? findCurrentTaskIndex(tasks) : -1), [tasks, isToday])

  if (!tasks.length) {
    return (
      <div className="py-10 text-center text-mute text-sm">
        {emptyText}
      </div>
    )
  }

  return (
    <div>
      {tasks.map((t, i) => (
        <TaskRow
          key={t.id}
          task={t}
          isCurrent={i === currentIdx}
          onToggle={(completed) => onToggle(t.id, completed)}
          onReschedule={(newISO) => onReschedule(t.id, newISO)}
          onPickDate={() => onPickDate(t.id)}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/tasks/TaskList.jsx
git commit -m "feat: add TaskList with current task detection"
```

---

### Task 11: AddTaskForm modal

**Files:**
- Create: `src/components/tasks/AddTaskForm.jsx`

- [ ] **Step 1: Create `src/components/tasks/AddTaskForm.jsx`**

```jsx
import { useState } from 'react'
import Button from '../ui/Button'
import { todayISO } from '../../lib/dates'

export default function AddTaskForm({ defaultDate = todayISO(), onSave, onCancel }) {
  const [name, setName] = useState('')
  const [hour, setHour] = useState('7')
  const [minute, setMinute] = useState('00')
  const [period, setPeriod] = useState('PM')
  const [date, setDate] = useState(defaultDate)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    // Convert to 24hr HH:mm
    let h = parseInt(hour, 10)
    if (period === 'PM' && h !== 12) h += 12
    if (period === 'AM' && h === 12) h = 0
    const time = `${String(h).padStart(2, '0')}:${minute.padStart(2, '0')}`
    try {
      await onSave({ name: name.trim(), time, date })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-[440px] bg-ivory rounded-t-3xl sm:rounded-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <h2 className="font-serif text-2xl text-ink mb-5">New Task</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] tracking-[1.5px] uppercase text-mute mb-1.5 block">Task Name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Read Kimball Ch. 3"
              className="w-full bg-ivory-3 border border-line rounded-xl px-3.5 py-3 text-sm text-ink focus:outline-none focus:border-maroon"
            />
          </div>

          <div>
            <label className="text-[10px] tracking-[1.5px] uppercase text-mute mb-1.5 block">Time</label>
            <div className="flex gap-2 items-center">
              <select
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="flex-1 bg-ivory-3 border border-line rounded-xl px-3 py-3 text-sm text-ink text-center"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                ))}
              </select>
              <span className="text-mute2 text-xl">:</span>
              <select
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="flex-1 bg-ivory-3 border border-line rounded-xl px-3 py-3 text-sm text-ink text-center"
              >
                {['00', '15', '30', '45'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="flex-1 bg-ivory-3 border border-line rounded-xl px-3 py-3 text-sm text-ink text-center"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] tracking-[1.5px] uppercase text-mute mb-1.5 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={todayISO()}
              className="w-full bg-ivory-3 border border-line rounded-xl px-3.5 py-3 text-sm text-ink focus:outline-none focus:border-maroon"
            />
          </div>

          <div className="pt-2 space-y-2">
            <Button type="submit" className="w-full" disabled={saving || !name.trim()}>
              {saving ? 'Saving…' : 'Save Task'}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/tasks/AddTaskForm.jsx
git commit -m "feat: add AddTaskForm modal"
```

---

### Task 12: DatePickerSheet for rescheduling

**Files:**
- Create: `src/components/tasks/DatePickerSheet.jsx`

- [ ] **Step 1: Create `src/components/tasks/DatePickerSheet.jsx`**

```jsx
import { useState } from 'react'
import Button from '../ui/Button'
import { todayISO } from '../../lib/dates'

export default function DatePickerSheet({ onPick, onCancel }) {
  const [date, setDate] = useState(todayISO())
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-[440px] bg-ivory rounded-t-3xl sm:rounded-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <h2 className="font-serif text-2xl text-ink mb-5">Reschedule to…</h2>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={todayISO()}
          className="w-full bg-ivory-3 border border-line rounded-xl px-3.5 py-3 text-sm text-ink mb-4 focus:outline-none focus:border-maroon"
        />
        <div className="space-y-2">
          <Button className="w-full" onClick={() => onPick(date)}>Move Task</Button>
          <Button variant="ghost" className="w-full" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/tasks/DatePickerSheet.jsx
git commit -m "feat: add DatePickerSheet for task rescheduling"
```

---

## Phase 4: Week Strip + Today Screen

### Task 13: WeekStrip component

**Files:**
- Create: `src/components/week/WeekStrip.jsx`

- [ ] **Step 1: Create `src/components/week/WeekStrip.jsx`**

```jsx
import { useMemo } from 'react'
import { cn } from '../../lib/classnames'
import {
  weekDays, isoFromDate, isPastDay, isTodayDate, formatShortDay, formatDayNum
} from '../../lib/dates'

export default function WeekStrip({ selectedISO, taskCounts = {}, onSelect }) {
  const days = useMemo(() => weekDays(new Date()), [])

  return (
    <div className="flex gap-1 mb-3.5 px-0.5">
      {days.map((d) => {
        const iso = isoFromDate(d)
        const past = isPastDay(d)
        const today = isTodayDate(d)
        const selected = iso === selectedISO
        const count = taskCounts[iso] || 0

        if (past) {
          // Reserve space but hide content
          return <div key={iso} className="flex-1 opacity-0 pointer-events-none" />
        }

        return (
          <button
            key={iso}
            onClick={() => onSelect(iso)}
            className={cn(
              'flex-1 flex flex-col items-center py-1.5 rounded-xl text-[10px] tracking-wide transition',
              today && selected && 'bg-maroon text-white/80',
              today && !selected && 'bg-maroon/10 text-maroon-deep',
              !today && selected && 'bg-maroon/[0.06] text-ink ring-1 ring-maroon/20',
              !today && !selected && 'text-mute',
            )}
          >
            <span>{formatShortDay(d)}</span>
            <span className={cn(
              'text-[15px] font-medium mt-0.5 leading-none',
              today && selected && 'text-white',
              today && !selected && 'text-maroon-deep',
              !today && 'text-ink',
            )}>{formatDayNum(d)}</span>
            {count > 0 && (
              <span className={cn(
                'text-[8px] mt-0.5',
                today && selected ? 'text-white/60' : 'text-mute2',
              )}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/week/WeekStrip.jsx
git commit -m "feat: add WeekStrip with past days hidden"
```

---

### Task 14: ProgressRing component

**Files:**
- Create: `src/components/ui/ProgressRing.jsx`

- [ ] **Step 1: Create `src/components/ui/ProgressRing.jsx`**

```jsx
export default function ProgressRing({ value = 0, size = 34, stroke = 3 }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = (value / 100) * c
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e0d8d2" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#8b1e30"
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${c}`}
        strokeLinecap="round"
      />
    </svg>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/ProgressRing.jsx
git commit -m "feat: add ProgressRing SVG component"
```

---

### Task 15: TodayScreen — wire it all together

**Files:**
- Create: `src/screens/TodayScreen.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `src/screens/TodayScreen.jsx`**

```jsx
import { useMemo, useState } from 'react'
import WeekStrip from '../components/week/WeekStrip'
import TaskList from '../components/tasks/TaskList'
import AddTaskForm from '../components/tasks/AddTaskForm'
import DatePickerSheet from '../components/tasks/DatePickerSheet'
import ProgressRing from '../components/ui/ProgressRing'
import {
  todayISO, weekDays, isoFromDate, formatHeaderDate, formatDayName, dateFromISO
} from '../lib/dates'
import { useTasksForDate, useTasksInRange, useTaskActions } from '../hooks/useTasks'

export default function TodayScreen() {
  const today = todayISO()
  const [selectedISO, setSelectedISO] = useState(today)
  const [showAdd, setShowAdd] = useState(false)
  const [reschedulingId, setReschedulingId] = useState(null)

  const { tasks } = useTasksForDate(selectedISO)
  const { createTask, toggleComplete, rescheduleTask } = useTaskActions()

  // Counts for week strip
  const days = useMemo(() => weekDays(new Date()), [])
  const startISO = isoFromDate(days[0])
  const endISO = isoFromDate(days[6])
  const weekTasks = useTasksInRange(startISO, endISO)
  const counts = useMemo(() => {
    const map = {}
    for (const t of weekTasks) map[t.date] = (map[t.date] || 0) + 1
    return map
  }, [weekTasks])

  const completed = tasks.filter((t) => t.completed).length
  const total = tasks.length
  const pct = total ? Math.round((completed / total) * 100) : 0
  const remaining = total - completed
  const isToday = selectedISO === today
  const selectedDate = dateFromISO(selectedISO)

  let subtext = 'No tasks yet — tap + to add one'
  if (total > 0) {
    if (remaining === 0) subtext = 'All done — nice work!'
    else if (completed === 0) subtext = `Let's get started`
    else subtext = `Keep going — ${remaining} left`
  }

  return (
    <div className="pb-4">
      <WeekStrip
        selectedISO={selectedISO}
        taskCounts={counts}
        onSelect={setSelectedISO}
      />

      <div className="flex items-start justify-between mb-3.5">
        <div>
          <div className="font-serif text-[22px] text-ink leading-tight">{formatHeaderDate(selectedDate)}</div>
          <div className="text-[11px] text-mute mt-0.5 uppercase tracking-[2px]">{formatDayName(selectedDate)}</div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="w-9 h-9 bg-gradient-to-br from-maroon to-maroon-dark rounded-xl text-white text-xl shadow-[0_4px_14px_rgba(139,30,48,0.2)]"
        >
          +
        </button>
      </div>

      {total > 0 && (
        <div className="flex items-center gap-2.5 mb-3 px-3 py-2 bg-maroon/[0.04] border border-maroon/[0.08] rounded-xl">
          <ProgressRing value={pct} />
          <div>
            <div className="text-[12px] text-maroon-deep font-medium">{completed} of {total} complete</div>
            <div className="text-[10px] text-mute">{subtext}</div>
          </div>
        </div>
      )}

      <TaskList
        tasks={tasks}
        isToday={isToday}
        onToggle={toggleComplete}
        onReschedule={rescheduleTask}
        onPickDate={(id) => setReschedulingId(id)}
        emptyText={isToday ? 'No tasks for today — tap + to add one' : 'Nothing planned for this day yet'}
      />

      {showAdd && (
        <AddTaskForm
          defaultDate={selectedISO}
          onSave={async (data) => { await createTask(data); setShowAdd(false) }}
          onCancel={() => setShowAdd(false)}
        />
      )}
      {reschedulingId && (
        <DatePickerSheet
          onPick={async (iso) => { await rescheduleTask(reschedulingId, iso); setReschedulingId(null) }}
          onCancel={() => setReschedulingId(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Wire it into `src/App.jsx`**

Replace placeholder for `index` route:

```jsx
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import PasscodeScreen from './screens/PasscodeScreen'
import AppShell from './components/layout/AppShell'
import TodayScreen from './screens/TodayScreen'

function Placeholder({ name }) {
  return (
    <div className="py-10 text-center">
      <h2 className="font-serif text-2xl text-ink">{name}</h2>
      <p className="text-mute text-sm mt-2">Coming soon</p>
    </div>
  )
}

export default function App() {
  const { authed, tryUnlock } = useAuth()
  if (!authed) return <PasscodeScreen onSubmit={tryUnlock} />
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<TodayScreen />} />
        <Route path="plan" element={<Placeholder name="Plan" />} />
        <Route path="progress" element={<Placeholder name="Progress" />} />
        <Route path="ai" element={<Placeholder name="AI" />} />
      </Route>
    </Routes>
  )
}
```

- [ ] **Step 3: Manual test (requires real Firebase env vars in `.env.local`)**

Run `npm run dev`. Unlock.
1. Tap + and add a task with a time → should appear in list, sorted by time
2. Tap checkbox → toggles done state (maroon checkmark, strikethrough)
3. Swipe left on a task → reveals TMR / 📅 buttons
4. Tap TMR → task disappears from today (it's now on tomorrow's list)
5. Tap a future day in the week strip → shows that day's tasks (empty state if none)
6. Past days in the strip are hidden (invisible blanks holding the space)

If Firebase env not set, browser console will show network errors but the UI will render with empty data.

- [ ] **Step 4: Commit**

```bash
git add src/screens/TodayScreen.jsx src/App.jsx
git commit -m "feat: wire TodayScreen with week strip, tasks, and add/reschedule"
```

---

## Phase 5: Templates

### Task 16: useTemplates hook

**Files:**
- Create: `src/hooks/useTemplates.js`

- [ ] **Step 1: Create `src/hooks/useTemplates.js`**

```js
import { useEffect, useState, useCallback } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

const COL = 'templates'

export function useTemplates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, COL), (snap) => {
      setTemplates(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  return { templates, loading }
}

export function useTemplateActions() {
  const createTemplate = useCallback(async ({ name, days, tasks }) => {
    return addDoc(collection(db, COL), {
      name,
      days,
      tasks,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }, [])

  const updateTemplate = useCallback(async (id, patch) => {
    await updateDoc(doc(db, COL, id), { ...patch, updatedAt: serverTimestamp() })
  }, [])

  const deleteTemplate = useCallback(async (id) => {
    await deleteDoc(doc(db, COL, id))
  }, [])

  return { createTemplate, updateTemplate, deleteTemplate }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useTemplates.js
git commit -m "feat: add useTemplates hook"
```

---

### Task 17: useTemplatePopulator hook (auto-populate tasks on day load)

**Files:**
- Create: `src/hooks/useTemplatePopulator.js`

- [ ] **Step 1: Create `src/hooks/useTemplatePopulator.js`**

```js
import { useEffect, useRef } from 'react'
import {
  collection, query, where, getDocs, addDoc, serverTimestamp, writeBatch, doc
} from 'firebase/firestore'
import { db } from '../firebase'
import { dateFromISO, dayKey } from '../lib/dates'

// For a given date, ensures any matching templates have populated their tasks.
// Idempotent: it checks for existing tasks with the same (fromTemplate, date) before adding.
export function useTemplatePopulator(dateISO, templates, ready = true) {
  // Track which (date, template) pairs we've already run in this session to avoid loops
  const ran = useRef(new Set())

  useEffect(() => {
    if (!ready || !dateISO || !templates) return
    const day = dayKey(dateFromISO(dateISO))
    const matching = templates.filter((t) => Array.isArray(t.days) && t.days.includes(day))
    if (!matching.length) return

    ;(async () => {
      const batch = writeBatch(db)
      let queued = 0
      for (const tpl of matching) {
        const key = `${dateISO}::${tpl.id}`
        if (ran.current.has(key)) continue
        // Check Firestore for existing tasks for this template+date
        const q = query(
          collection(db, 'tasks'),
          where('date', '==', dateISO),
          where('fromTemplate', '==', tpl.id)
        )
        const snap = await getDocs(q)
        if (snap.empty) {
          for (const item of (tpl.tasks || [])) {
            const ref = doc(collection(db, 'tasks'))
            batch.set(ref, {
              name: item.name,
              time: item.time,
              date: dateISO,
              completed: false,
              completedAt: null,
              fromTemplate: tpl.id,
              createdAt: serverTimestamp(),
            })
            queued++
          }
        }
        ran.current.add(key)
      }
      if (queued > 0) await batch.commit()
    })().catch((e) => console.error('template populate failed', e))
  }, [dateISO, templates, ready])
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useTemplatePopulator.js
git commit -m "feat: add useTemplatePopulator for auto-populating template tasks"
```

---

### Task 18: TemplateCard component

**Files:**
- Create: `src/components/templates/TemplateCard.jsx`

- [ ] **Step 1: Create `src/components/templates/TemplateCard.jsx`**

```jsx
import Card from '../ui/Card'
import { formatTime12 } from '../../lib/dates'

const DAY_LABELS = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }
const ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

function formatDays(days) {
  const sorted = ORDER.filter((d) => days?.includes(d))
  if (sorted.length === 0) return ''
  // Detect contiguous Mon-Fri / Sat-Sun shortcuts
  const set = new Set(sorted)
  if (sorted.length === 5 && ['mon','tue','wed','thu','fri'].every((d) => set.has(d))) return 'Mon – Fri'
  if (sorted.length === 2 && set.has('sat') && set.has('sun')) return 'Sat – Sun'
  if (sorted.length === 7) return 'Every day'
  return sorted.map((d) => DAY_LABELS[d]).join(', ')
}

export default function TemplateCard({ template, onEdit }) {
  const preview = (template.tasks || []).slice(0, 3)
  return (
    <Card className="p-4 mb-2.5" onClick={onEdit} role="button">
      <div className="flex justify-between items-center mb-2">
        <div className="text-[15px] font-medium text-ink">{template.name}</div>
        <div className="text-[10px] text-white bg-maroon px-2 py-0.5 rounded-md font-medium tracking-wide">
          {formatDays(template.days)}
        </div>
      </div>
      <div className="text-[11px] text-mute leading-relaxed font-light">
        {preview.map((t, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-mute2 flex-shrink-0" />
            <span>{formatTime12(t.time)} — {t.name}</span>
          </div>
        ))}
        {(template.tasks?.length || 0) > 3 && (
          <div className="text-mute2 mt-1 italic">+ {template.tasks.length - 3} more</div>
        )}
      </div>
    </Card>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/templates/TemplateCard.jsx
git commit -m "feat: add TemplateCard preview component"
```

---

### Task 19: TemplateForm (create/edit) modal

**Files:**
- Create: `src/components/templates/TemplateForm.jsx`

- [ ] **Step 1: Create `src/components/templates/TemplateForm.jsx`**

```jsx
import { useState } from 'react'
import Button from '../ui/Button'
import { cn } from '../../lib/classnames'

const DAYS = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
]

export default function TemplateForm({ initial, onSave, onCancel, onDelete }) {
  const [name, setName] = useState(initial?.name || '')
  const [days, setDays] = useState(initial?.days || ['mon', 'tue', 'wed', 'thu', 'fri'])
  const [tasks, setTasks] = useState(initial?.tasks || [{ name: '', time: '09:00' }])
  const [saving, setSaving] = useState(false)

  function toggleDay(d) {
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])
  }
  function updateTask(i, patch) {
    setTasks((prev) => prev.map((t, idx) => idx === i ? { ...t, ...patch } : t))
  }
  function addTaskRow() {
    setTasks((prev) => [...prev, { name: '', time: '19:00' }])
  }
  function removeTask(i) {
    setTasks((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !days.length) return
    const cleaned = tasks.filter((t) => t.name.trim() && t.time)
    setSaving(true)
    try {
      await onSave({ name: name.trim(), days, tasks: cleaned })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-[440px] bg-ivory rounded-t-3xl sm:rounded-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] max-h-[90vh] overflow-y-auto">
        <h2 className="font-serif text-2xl text-ink mb-5">{initial ? 'Edit Template' : 'New Template'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] tracking-[1.5px] uppercase text-mute mb-1.5 block">Name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weekday Routine"
              className="w-full bg-ivory-3 border border-line rounded-xl px-3.5 py-3 text-sm text-ink focus:outline-none focus:border-maroon"
            />
          </div>

          <div>
            <label className="text-[10px] tracking-[1.5px] uppercase text-mute mb-1.5 block">Days</label>
            <div className="flex gap-1.5">
              {DAYS.map((d) => (
                <button
                  type="button"
                  key={d.key}
                  onClick={() => toggleDay(d.key)}
                  className={cn(
                    'flex-1 py-2.5 rounded-lg text-sm font-medium border transition',
                    days.includes(d.key)
                      ? 'bg-maroon text-white border-maroon'
                      : 'bg-ivory-3 text-mute border-line'
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] tracking-[1.5px] uppercase text-mute mb-1.5 block">Tasks</label>
            <div className="space-y-2">
              {tasks.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={t.name}
                    onChange={(e) => updateTask(i, { name: e.target.value })}
                    placeholder="Task"
                    className="flex-1 bg-ivory-3 border border-line rounded-lg px-3 py-2.5 text-sm text-ink"
                  />
                  <input
                    type="time"
                    value={t.time}
                    onChange={(e) => updateTask(i, { time: e.target.value })}
                    className="w-24 bg-ivory-3 border border-line rounded-lg px-2 py-2.5 text-sm text-ink"
                  />
                  <button
                    type="button"
                    onClick={() => removeTask(i)}
                    className="text-mute2 text-xl px-2"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTaskRow}
                className="text-maroon-deep text-sm font-medium"
              >
                + Add task
              </button>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <Button type="submit" className="w-full" disabled={saving || !name.trim() || !days.length}>
              {saving ? 'Saving…' : 'Save Template'}
            </Button>
            {initial && (
              <Button type="button" variant="ghost" className="w-full text-red-700" onClick={onDelete}>
                Delete Template
              </Button>
            )}
            <Button type="button" variant="ghost" className="w-full" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/templates/TemplateForm.jsx
git commit -m "feat: add TemplateForm for create/edit/delete"
```

---

## Phase 6: Goals + Plan Screen

### Task 20: useGoals hook

**Files:**
- Create: `src/hooks/useGoals.js`

- [ ] **Step 1: Create `src/hooks/useGoals.js`**

```js
import { useEffect, useState, useCallback } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

const COL = 'goals'

export function useGoals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, COL), (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      // Active first, then completed; within each, newest first
      rows.sort((a, b) => {
        if (a.status !== b.status) return a.status === 'active' ? -1 : 1
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      })
      setGoals(rows)
      setLoading(false)
    })
    return unsub
  }, [])

  return { goals, loading }
}

export function useGoalActions() {
  const createGoal = useCallback(async ({ title, description, targetDate }) => {
    return addDoc(collection(db, COL), {
      title,
      description: description || '',
      targetDate: targetDate || null,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }, [])

  const updateGoal = useCallback(async (id, patch) => {
    await updateDoc(doc(db, COL, id), { ...patch, updatedAt: serverTimestamp() })
  }, [])

  const deleteGoal = useCallback(async (id) => {
    await deleteDoc(doc(db, COL, id))
  }, [])

  return { createGoal, updateGoal, deleteGoal }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useGoals.js
git commit -m "feat: add useGoals hook"
```

---

### Task 21: GoalCard component

**Files:**
- Create: `src/components/goals/GoalCard.jsx`

- [ ] **Step 1: Create `src/components/goals/GoalCard.jsx`**

```jsx
import Card from '../ui/Card'
import { cn } from '../../lib/classnames'
import { format, parseISO } from 'date-fns'

export default function GoalCard({ goal, onEdit }) {
  const active = goal.status === 'active'
  return (
    <Card className="p-4 mb-3" onClick={onEdit} role="button">
      <div className="flex items-start justify-between mb-2">
        <div className="text-[15px] font-medium text-ink leading-tight flex-1">{goal.title}</div>
        <span className={cn(
          'text-[9px] px-2 py-0.5 rounded-md font-medium uppercase tracking-wide ml-2 flex-shrink-0',
          active ? 'bg-maroon/10 text-maroon-deep' : 'bg-emerald-700/10 text-emerald-700'
        )}>
          {active ? 'Active' : 'Done'}
        </span>
      </div>
      {goal.description && (
        <div className="text-[12px] text-mute leading-relaxed font-light whitespace-pre-line mb-2">
          {goal.description}
        </div>
      )}
      {goal.targetDate && (
        <div className="flex items-center gap-1 text-[10px] text-maroon-deep">
          <span className="text-xs">◎</span>
          Target: {format(parseISO(goal.targetDate), 'MMM d, yyyy')}
        </div>
      )}
    </Card>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/goals/GoalCard.jsx
git commit -m "feat: add GoalCard component"
```

---

### Task 22: GoalForm modal

**Files:**
- Create: `src/components/goals/GoalForm.jsx`

- [ ] **Step 1: Create `src/components/goals/GoalForm.jsx`**

```jsx
import { useState } from 'react'
import Button from '../ui/Button'

export default function GoalForm({ initial, onSave, onCancel, onDelete }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [targetDate, setTargetDate] = useState(initial?.targetDate || '')
  const [status, setStatus] = useState(initial?.status || 'active')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        targetDate: targetDate || null,
        status,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-[440px] bg-ivory rounded-t-3xl sm:rounded-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] max-h-[90vh] overflow-y-auto">
        <h2 className="font-serif text-2xl text-ink mb-5">{initial ? 'Edit Goal' : 'New Goal'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] tracking-[1.5px] uppercase text-mute mb-1.5 block">Title</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. SQL Mastery"
              className="w-full bg-ivory-3 border border-line rounded-xl px-3.5 py-3 text-sm text-ink focus:outline-none focus:border-maroon"
            />
          </div>
          <div>
            <label className="text-[10px] tracking-[1.5px] uppercase text-mute mb-1.5 block">Description</label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you want to achieve? Resources, milestones, notes…"
              className="w-full bg-ivory-3 border border-line rounded-xl px-3.5 py-3 text-sm text-ink focus:outline-none focus:border-maroon resize-none"
            />
          </div>
          <div>
            <label className="text-[10px] tracking-[1.5px] uppercase text-mute mb-1.5 block">Target Date (optional)</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-ivory-3 border border-line rounded-xl px-3.5 py-3 text-sm text-ink focus:outline-none focus:border-maroon"
            />
          </div>
          {initial && (
            <div>
              <label className="text-[10px] tracking-[1.5px] uppercase text-mute mb-1.5 block">Status</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('active')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border ${status === 'active' ? 'bg-maroon text-white border-maroon' : 'bg-ivory-3 text-mute border-line'}`}
                >Active</button>
                <button
                  type="button"
                  onClick={() => setStatus('completed')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border ${status === 'completed' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-ivory-3 text-mute border-line'}`}
                >Completed</button>
              </div>
            </div>
          )}

          <div className="pt-2 space-y-2">
            <Button type="submit" className="w-full" disabled={saving || !title.trim()}>
              {saving ? 'Saving…' : 'Save Goal'}
            </Button>
            {initial && (
              <Button type="button" variant="ghost" className="w-full text-red-700" onClick={onDelete}>
                Delete Goal
              </Button>
            )}
            <Button type="button" variant="ghost" className="w-full" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/goals/GoalForm.jsx
git commit -m "feat: add GoalForm modal"
```

---

### Task 23: Segmented control + PlanScreen

**Files:**
- Create: `src/components/ui/Segmented.jsx`, `src/screens/PlanScreen.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `src/components/ui/Segmented.jsx`**

```jsx
import { cn } from '../../lib/classnames'

export default function Segmented({ value, onChange, options }) {
  return (
    <div className="flex bg-ivory-3 rounded-xl p-1 mb-4">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 py-2 rounded-lg text-sm font-medium tracking-wide transition',
            value === opt.value
              ? 'bg-white text-maroon-deep shadow-[0_1px_4px_rgba(0,0,0,0.06)]'
              : 'text-mute'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/screens/PlanScreen.jsx`**

```jsx
import { useState } from 'react'
import Segmented from '../components/ui/Segmented'
import Button from '../components/ui/Button'
import TemplateCard from '../components/templates/TemplateCard'
import TemplateForm from '../components/templates/TemplateForm'
import GoalCard from '../components/goals/GoalCard'
import GoalForm from '../components/goals/GoalForm'
import { useTemplates, useTemplateActions } from '../hooks/useTemplates'
import { useGoals, useGoalActions } from '../hooks/useGoals'

export default function PlanScreen() {
  const [tab, setTab] = useState('templates')
  const [editingTpl, setEditingTpl] = useState(null) // null | 'new' | template object
  const [editingGoal, setEditingGoal] = useState(null)

  const { templates } = useTemplates()
  const { goals } = useGoals()
  const tplActions = useTemplateActions()
  const goalActions = useGoalActions()

  async function saveTemplate(data) {
    if (editingTpl && editingTpl !== 'new') {
      await tplActions.updateTemplate(editingTpl.id, data)
    } else {
      await tplActions.createTemplate(data)
    }
    setEditingTpl(null)
  }
  async function deleteTemplate() {
    if (editingTpl && editingTpl !== 'new') {
      await tplActions.deleteTemplate(editingTpl.id)
    }
    setEditingTpl(null)
  }

  async function saveGoal(data) {
    if (editingGoal && editingGoal !== 'new') {
      await goalActions.updateGoal(editingGoal.id, data)
    } else {
      await goalActions.createGoal(data)
    }
    setEditingGoal(null)
  }
  async function deleteGoal() {
    if (editingGoal && editingGoal !== 'new') {
      await goalActions.deleteGoal(editingGoal.id)
    }
    setEditingGoal(null)
  }

  return (
    <div className="pb-6 pt-1">
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'templates', label: 'Templates' },
          { value: 'goals', label: 'Goals' },
        ]}
      />

      {tab === 'templates' && (
        <>
          {templates.length === 0 && (
            <div className="py-8 text-center text-mute text-sm">
              No templates yet. Add one to auto-fill your daily routine.
            </div>
          )}
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} onEdit={() => setEditingTpl(t)} />
          ))}
          <Button className="w-full mt-3" onClick={() => setEditingTpl('new')}>+ New Template</Button>
        </>
      )}

      {tab === 'goals' && (
        <>
          {goals.length === 0 && (
            <div className="py-8 text-center text-mute text-sm">
              No goals yet. Add a long-term goal — the AI will use it to plan.
            </div>
          )}
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} onEdit={() => setEditingGoal(g)} />
          ))}
          <Button className="w-full mt-3" onClick={() => setEditingGoal('new')}>+ New Goal</Button>
        </>
      )}

      {editingTpl && (
        <TemplateForm
          initial={editingTpl === 'new' ? null : editingTpl}
          onSave={saveTemplate}
          onCancel={() => setEditingTpl(null)}
          onDelete={deleteTemplate}
        />
      )}
      {editingGoal && (
        <GoalForm
          initial={editingGoal === 'new' ? null : editingGoal}
          onSave={saveGoal}
          onCancel={() => setEditingGoal(null)}
          onDelete={deleteGoal}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Wire into `src/App.jsx`**

```jsx
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import PasscodeScreen from './screens/PasscodeScreen'
import AppShell from './components/layout/AppShell'
import TodayScreen from './screens/TodayScreen'
import PlanScreen from './screens/PlanScreen'

function Placeholder({ name }) {
  return (
    <div className="py-10 text-center">
      <h2 className="font-serif text-2xl text-ink">{name}</h2>
      <p className="text-mute text-sm mt-2">Coming soon</p>
    </div>
  )
}

export default function App() {
  const { authed, tryUnlock } = useAuth()
  if (!authed) return <PasscodeScreen onSubmit={tryUnlock} />
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<TodayScreen />} />
        <Route path="plan" element={<PlanScreen />} />
        <Route path="progress" element={<Placeholder name="Progress" />} />
        <Route path="ai" element={<Placeholder name="AI" />} />
      </Route>
    </Routes>
  )
}
```

- [ ] **Step 4: Manual test**

Run `npm run dev`. Unlock. Tap "Plan":
1. Templates tab shows empty state
2. Tap "+ New Template", create one with name "Weekday Routine", Mon–Fri checked, 2 tasks → appears as card
3. Tap card → edits the template
4. Switch to Goals tab, create a goal with title, description, target date → appears as card

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Segmented.jsx src/screens/PlanScreen.jsx src/App.jsx
git commit -m "feat: add Plan screen with Templates and Goals tabs"
```

---

### Task 24: Integrate template auto-population into TodayScreen

**Files:**
- Modify: `src/screens/TodayScreen.jsx`

- [ ] **Step 1: Update `src/screens/TodayScreen.jsx`**

Add imports near the top:

```jsx
import { useTemplates } from '../hooks/useTemplates'
import { useTemplatePopulator } from '../hooks/useTemplatePopulator'
```

Inside the component, after the existing hooks, add:

```jsx
const { templates, loading: tplLoading } = useTemplates()
useTemplatePopulator(selectedISO, templates, !tplLoading)
```

- [ ] **Step 2: Manual test**

Run `npm run dev`.
1. Create a template for "today's day of week" with 2 tasks (e.g. if today is Wednesday, check "Wed")
2. Go to Today → the 2 template tasks should appear automatically
3. The template tasks should show the "template" badge
4. Refreshing the page should NOT duplicate them

- [ ] **Step 3: Commit**

```bash
git add src/screens/TodayScreen.jsx
git commit -m "feat: auto-populate tasks from matching templates on Today screen"
```

---

## Phase 7: Progress Screen + History

### Task 25: CompletionChart component (Recharts)

**Files:**
- Create: `src/components/progress/CompletionChart.jsx`

- [ ] **Step 1: Create `src/components/progress/CompletionChart.jsx`**

```jsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts'

// data: [{ label: 'Mon', value: 60, iso: '2026-05-19' }, ...]
export default function CompletionChart({ data }) {
  return (
    <div className="bg-maroon/[0.03] border border-maroon/[0.08] rounded-2xl p-4 pb-2 mb-3">
      <div className="text-[10px] uppercase tracking-[1.5px] text-mute mb-3 font-normal">
        Daily Completion Rate
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b1e30" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#8b1e30" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e0d8d2" strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: '#c0b8b0' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tick={{ fontSize: 9, fill: '#c0b8b0' }}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8b1e30"
              strokeWidth={2}
              fill="url(#areaFill)"
              dot={{ r: 3, fill: '#faf8f6', stroke: '#8b1e30', strokeWidth: 1.5 }}
              activeDot={{ r: 4 }}
              isAnimationActive={true}
              animationDuration={400}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/progress/CompletionChart.jsx
git commit -m "feat: add CompletionChart with Recharts area+line"
```

---

### Task 26: StatCards and StreakBar

**Files:**
- Create: `src/components/progress/StatCards.jsx`, `src/components/progress/StreakBar.jsx`

- [ ] **Step 1: Create `src/components/progress/StatCards.jsx`**

```jsx
export default function StatCards({ weekPct, deltaPct }) {
  const deltaSign = deltaPct > 0 ? '↑' : deltaPct < 0 ? '↓' : '·'
  const deltaColor = deltaPct > 0 ? 'text-emerald-700' : deltaPct < 0 ? 'text-red-700' : 'text-maroon-deep'
  return (
    <div className="flex gap-2.5 mb-3">
      <div className="flex-1 bg-white border border-black/5 rounded-xl p-3 text-center shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
        <div className="font-serif text-2xl text-maroon-deep leading-none">{weekPct}%</div>
        <div className="text-[9px] uppercase tracking-[1.5px] text-mute mt-1 font-light">This Week</div>
      </div>
      <div className="flex-1 bg-white border border-black/5 rounded-xl p-3 text-center shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
        <div className={`font-serif text-2xl leading-none ${deltaColor}`}>
          {deltaSign} {Math.abs(deltaPct)}%
        </div>
        <div className="text-[9px] uppercase tracking-[1.5px] text-mute mt-1 font-light">vs Last Week</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/progress/StreakBar.jsx`**

```jsx
function streakMessage(streak) {
  if (streak === 0) return 'Start one today!'
  if (streak === 1) return 'Day one — keep going'
  if (streak < 5) return 'Building momentum'
  if (streak < 10) return 'Strong streak — keep it alive'
  return 'You\'re on fire'
}

export default function StreakBar({ streak }) {
  return (
    <div className="flex items-center gap-2.5 p-3 bg-gradient-to-br from-maroon/[0.06] to-maroon/[0.02] border border-maroon/10 rounded-xl mb-3">
      <div className="text-lg">🔥</div>
      <div className="flex-1">
        <div className="text-sm text-ink font-medium">{streak} day streak</div>
        <div className="text-[10px] text-mute font-light">{streakMessage(streak)}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/progress/StatCards.jsx src/components/progress/StreakBar.jsx
git commit -m "feat: add StatCards and StreakBar components"
```

---

### Task 27: HistorySection component

**Files:**
- Create: `src/components/progress/HistorySection.jsx`

- [ ] **Step 1: Create `src/components/progress/HistorySection.jsx`**

```jsx
import { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { cn } from '../../lib/classnames'
import { formatTime12 } from '../../lib/dates'

// tasksByDate: { 'YYYY-MM-DD': [task, task, ...] } — only past dates
export default function HistorySection({ tasksByDate }) {
  const [open, setOpen] = useState(false)
  const [expandedISO, setExpandedISO] = useState(null)

  const days = useMemo(() => {
    return Object.entries(tasksByDate)
      .map(([iso, list]) => {
        const done = list.filter((t) => t.completed).length
        return { iso, total: list.length, done, list }
      })
      .sort((a, b) => b.iso.localeCompare(a.iso))
  }, [tasksByDate])

  return (
    <div className="border-t border-black/5 pt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex justify-between items-center"
      >
        <div className="font-serif text-base text-ink">History</div>
        <div className={cn('text-mute text-xs transition', open && 'rotate-180')}>▼</div>
      </button>

      {open && (
        <div className="mt-2.5">
          {days.length === 0 && (
            <div className="text-mute text-sm py-3 text-center">No past days yet.</div>
          )}
          {days.map((d) => {
            const isExpanded = expandedISO === d.iso
            return (
              <div key={d.iso} className="border-b border-black/[0.03]">
                <button
                  onClick={() => setExpandedISO(isExpanded ? null : d.iso)}
                  className="w-full flex justify-between items-center py-2.5"
                >
                  <div className="text-[12px] text-ink">
                    {format(parseISO(d.iso), 'EEE, MMM d')}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[11px] text-mute font-light">{d.done} of {d.total} done</div>
                    <div className={cn('text-mute2 text-[10px] transition', isExpanded && 'rotate-90')}>›</div>
                  </div>
                </button>
                {isExpanded && (
                  <div className="pb-3 pl-2">
                    {d.list.length === 0 && (
                      <div className="text-mute text-xs">No tasks for this day.</div>
                    )}
                    {d.list
                      .slice()
                      .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                      .map((t) => (
                      <div key={t.id} className="flex items-center gap-2 py-1">
                        <div className={cn(
                          'w-3 h-3 rounded-[3px] border flex-shrink-0',
                          t.completed ? 'bg-maroon border-maroon' : 'border-mute2'
                        )} />
                        <div className={cn(
                          'flex-1 text-[12px]',
                          t.completed ? 'text-mute2 line-through' : 'text-ink'
                        )}>
                          {t.name}
                        </div>
                        <div className="text-[10px] text-mute tabular">{formatTime12(t.time)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/progress/HistorySection.jsx
git commit -m "feat: add HistorySection collapsible past-day list"
```

---

### Task 28: ProgressScreen — wire chart, stats, streak, history

**Files:**
- Create: `src/screens/ProgressScreen.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `src/screens/ProgressScreen.jsx`**

```jsx
import { useMemo } from 'react'
import CompletionChart from '../components/progress/CompletionChart'
import StatCards from '../components/progress/StatCards'
import StreakBar from '../components/progress/StreakBar'
import HistorySection from '../components/progress/HistorySection'
import { useTasksInRange } from '../hooks/useTasks'
import { lastNDays, todayISO } from '../lib/dates'
import { format, parseISO } from 'date-fns'

function bucketByDate(tasks) {
  const map = {}
  for (const t of tasks) {
    if (!map[t.date]) map[t.date] = []
    map[t.date].push(t)
  }
  return map
}

function pctForDay(list) {
  if (!list || list.length === 0) return null
  const done = list.filter((t) => t.completed).length
  return Math.round((done / list.length) * 100)
}

export default function ProgressScreen() {
  const today = todayISO()
  // Last 14 days inclusive: 7 for "last week" + 7 for "this week"
  const days14 = useMemo(() => lastNDays(14), [])
  const start = days14[0]
  const end = days14[13]
  const tasks = useTasksInRange(start, end)

  const byDate = useMemo(() => bucketByDate(tasks), [tasks])

  // Chart data: last 7 days, labelled Mon–Sun by day
  const chartDays = days14.slice(7)
  const chartData = chartDays.map((iso) => ({
    label: format(parseISO(iso), 'EEE'),
    iso,
    value: pctForDay(byDate[iso]) ?? 0,
  }))

  // Week averages
  const thisWeek = chartDays.map((iso) => pctForDay(byDate[iso])).filter((v) => v !== null)
  const lastWeek = days14.slice(0, 7).map((iso) => pctForDay(byDate[iso])).filter((v) => v !== null)
  const avg = (arr) => arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0
  const weekPct = avg(thisWeek)
  const lastPct = avg(lastWeek)
  const deltaPct = weekPct - lastPct

  // Streak: count consecutive days backwards from today with >= 1 completed task
  const streak = useMemo(() => {
    let s = 0
    for (let i = chartDays.length - 1; i >= 0; i--) {
      const iso = chartDays[i]
      const list = byDate[iso] || []
      const anyDone = list.some((t) => t.completed)
      if (iso === today && list.length === 0) {
        // Today might be empty — don't break streak
        continue
      }
      if (anyDone) s++
      else break
    }
    return s
  }, [chartDays, byDate, today])

  // History: only past days (exclude today)
  const historyByDate = useMemo(() => {
    const out = {}
    for (const [iso, list] of Object.entries(byDate)) {
      if (iso < today) out[iso] = list
    }
    return out
  }, [byDate, today])

  return (
    <div className="pb-6 pt-1">
      <h1 className="font-serif text-[22px] text-ink leading-tight">Progress</h1>
      <p className="text-[10px] uppercase tracking-[2px] text-mute mt-0.5 mb-3.5 font-light">Last 7 days</p>

      <CompletionChart data={chartData} />
      <StatCards weekPct={weekPct} deltaPct={deltaPct} />
      <StreakBar streak={streak} />
      <HistorySection tasksByDate={historyByDate} />
    </div>
  )
}
```

- [ ] **Step 2: Wire into `src/App.jsx`**

Replace progress placeholder:

```jsx
import ProgressScreen from './screens/ProgressScreen'
// ...
<Route path="progress" element={<ProgressScreen />} />
```

- [ ] **Step 3: Manual test**

Run `npm run dev`.
1. Mark some tasks done on today and a few past days (you may need to manually backdate by editing Firestore, or just check that today shows 0–100% correctly)
2. Chart renders a line/area graph for 7 days
3. Stat cards show This Week %, vs Last Week %
4. Streak shows a number
5. Expand History → see past days with completion counts; tap a day to expand its task list

- [ ] **Step 4: Commit**

```bash
git add src/screens/ProgressScreen.jsx src/App.jsx
git commit -m "feat: wire ProgressScreen with chart, stats, streak, history"
```

---

## Phase 8: Gemini AI Assistant

### Task 29: Gemini client library

**Files:**
- Create: `src/lib/gemini.js`

- [ ] **Step 1: Create `src/lib/gemini.js`**

```js
import { GoogleGenerativeAI } from '@google/generative-ai'

let _client = null
function client() {
  if (_client) return _client
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key) throw new Error('Missing VITE_GEMINI_API_KEY')
  _client = new GoogleGenerativeAI(key)
  return _client
}

const MODEL = 'gemini-2.5-flash'

const SYSTEM_PROMPT = `You are a personal planning assistant inside a daily planner app. Your job: help the user plan their day or week, informed by their goals and recent progress.

RULES:
- Be concise. Speak in short paragraphs.
- When suggesting tasks, ALWAYS output them as a JSON block at the END of your response, like:
  \`\`\`json
  {"suggestions": [{"name": "Window functions practice", "time": "19:00", "date": "today"}, ...]}
  \`\`\`
- "time" must be 24hr HH:mm format.
- "date" must be either "today", "tomorrow", a weekday name ("monday", "tuesday", ...), or an explicit YYYY-MM-DD string.
- If a request needs no task suggestions (e.g. the user is asking a question), omit the JSON block entirely.
- Use the user's goals to make suggestions relevant. Reference their progress when motivating.
- Do not invent goals, templates, or completion stats that aren't in the context.`

function buildContextBlock({ goals, templates, todayTasks, recentCompletion, todayISO, weekDates }) {
  const lines = []
  lines.push(`Today's date: ${todayISO}`)
  lines.push(`This week: ${weekDates.join(', ')}`)
  if (goals?.length) {
    lines.push('\nActive goals:')
    for (const g of goals) {
      lines.push(`- ${g.title}${g.targetDate ? ` (target ${g.targetDate})` : ''}: ${g.description || '(no notes)'}`)
    }
  }
  if (templates?.length) {
    lines.push('\nRecurring templates:')
    for (const t of templates) {
      const tasks = (t.tasks || []).map((x) => `${x.time} ${x.name}`).join('; ')
      lines.push(`- ${t.name} [${(t.days || []).join(',')}]: ${tasks}`)
    }
  }
  if (todayTasks?.length) {
    lines.push('\nToday\'s tasks:')
    for (const t of todayTasks) {
      lines.push(`- [${t.completed ? 'x' : ' '}] ${t.time} ${t.name}`)
    }
  }
  if (recentCompletion) {
    lines.push(`\nRecent completion: this week ${recentCompletion.weekPct}%, vs last week ${recentCompletion.deltaPct > 0 ? '+' : ''}${recentCompletion.deltaPct}%, ${recentCompletion.streak}-day streak`)
  }
  return lines.join('\n')
}

// history: [{ role: 'user'|'assistant', content: string }]
// userMessage: string
// context: object passed to buildContextBlock
export async function chat({ history, userMessage, context }) {
  const model = client().getGenerativeModel({
    model: MODEL,
    systemInstruction: SYSTEM_PROMPT,
  })

  const contextBlock = buildContextBlock(context)

  // Convert history to Gemini chat format
  const geminiHistory = history.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  // Start chat with prior history (excluding the new message)
  const chatSession = model.startChat({ history: geminiHistory })

  const fullMessage = `[CONTEXT]\n${contextBlock}\n[/CONTEXT]\n\n${userMessage}`
  const result = await chatSession.sendMessage(fullMessage)
  const text = result.response.text()
  return parseResponse(text)
}

// Strip the JSON block from the response, return { text, suggestions }
function parseResponse(raw) {
  const re = /```json\s*([\s\S]*?)```/g
  let suggestions = null
  let cleaned = raw
  const matches = [...raw.matchAll(re)]
  if (matches.length) {
    const last = matches[matches.length - 1]
    try {
      const parsed = JSON.parse(last[1].trim())
      if (Array.isArray(parsed.suggestions)) {
        suggestions = parsed.suggestions
        cleaned = raw.replace(last[0], '').trim()
      }
    } catch (e) {
      // Ignore parse errors — leave raw text
    }
  }
  return { text: cleaned, suggestions }
}

// Convert AI-suggested date keyword to ISO
export function resolveDateKeyword(keyword, todayDate = new Date()) {
  if (!keyword) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(keyword)) return keyword
  const lower = keyword.toLowerCase().trim()
  const fmt = (d) => d.toISOString().slice(0, 10)
  if (lower === 'today') return fmt(todayDate)
  if (lower === 'tomorrow') {
    const d = new Date(todayDate); d.setDate(d.getDate() + 1); return fmt(d)
  }
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
  const idx = days.indexOf(lower)
  if (idx >= 0) {
    const d = new Date(todayDate)
    const delta = (idx - d.getDay() + 7) % 7 || 7
    d.setDate(d.getDate() + delta)
    return fmt(d)
  }
  return null
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/gemini.js
git commit -m "feat: add Gemini client with system prompt and response parsing"
```

---

### Task 30: useChat hook

**Files:**
- Create: `src/hooks/useChat.js`

- [ ] **Step 1: Create `src/hooks/useChat.js`**

```js
import { useEffect, useState, useCallback } from 'react'
import {
  collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, getDocs
} from 'firebase/firestore'
import { db } from '../firebase'

const COL = 'chatMessages'
const LIMIT = 50

export function useChat() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, COL), orderBy('createdAt', 'asc'), limit(LIMIT))
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  const appendMessage = useCallback(async ({ role, content, suggestions = null }) => {
    return addDoc(collection(db, COL), {
      role,
      content,
      suggestions,
      createdAt: serverTimestamp(),
    })
  }, [])

  const clearHistory = useCallback(async () => {
    const snap = await getDocs(collection(db, COL))
    await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, COL, d.id))))
  }, [])

  return { messages, loading, appendMessage, clearHistory }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useChat.js
git commit -m "feat: add useChat hook with persistent message history"
```

---

### Task 31: ChatMessage and MemoryBar components

**Files:**
- Create: `src/components/ai/ChatMessage.jsx`, `src/components/ai/MemoryBar.jsx`

- [ ] **Step 1: Create `src/components/ai/ChatMessage.jsx`**

```jsx
import { cn } from '../../lib/classnames'
import { formatTime12 } from '../../lib/dates'
import { format, parseISO } from 'date-fns'

function formatDateChip(iso) {
  if (!iso) return ''
  try {
    return format(parseISO(iso), 'EEE MMM d')
  } catch {
    return iso
  }
}

export default function ChatMessage({ message, onAddSuggestion }) {
  const isUser = message.role === 'user'
  return (
    <div className={cn('mb-2 flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'max-w-[88%] px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl',
        isUser
          ? 'bg-maroon text-white rounded-br-md whitespace-pre-wrap'
          : 'bg-white text-ink border border-line rounded-bl-md'
      )}>
        {message.content && (
          <div className={cn(isUser ? '' : 'whitespace-pre-wrap')}>{message.content}</div>
        )}
        {!isUser && Array.isArray(message.suggestions) && message.suggestions.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {message.suggestions.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-maroon/[0.04] border border-maroon/10 rounded-lg px-2.5 py-2"
              >
                <div className="flex-1 text-[12px] text-ink truncate pr-2">{s.name}</div>
                <div className="text-[10px] text-mute mr-2 whitespace-nowrap">
                  {formatDateChip(s.resolvedDate)} · {formatTime12(s.time)}
                </div>
                <button
                  onClick={() => onAddSuggestion(s, i)}
                  disabled={s.added}
                  className={cn(
                    'w-6 h-6 rounded-md flex items-center justify-center text-sm flex-shrink-0',
                    s.added ? 'bg-emerald-700 text-white' : 'bg-maroon text-white'
                  )}
                >
                  {s.added ? '✓' : '+'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/ai/MemoryBar.jsx`**

```jsx
export default function MemoryBar({ chips }) {
  if (!chips || chips.length === 0) return null
  return (
    <div className="flex items-center gap-1.5 p-2.5 bg-maroon/[0.04] border border-maroon/[0.08] rounded-xl mb-3 flex-wrap">
      <div className="text-[9px] text-maroon-deep font-medium uppercase tracking-[1px] mr-1">Memory:</div>
      {chips.map((chip, i) => (
        <div
          key={i}
          className="text-[9px] text-mute bg-white border border-line px-2 py-0.5 rounded-md"
        >
          {chip}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ai/
git commit -m "feat: add ChatMessage and MemoryBar components"
```

---

### Task 32: ChatInput component

**Files:**
- Create: `src/components/ai/ChatInput.jsx`

- [ ] **Step 1: Create `src/components/ai/ChatInput.jsx`**

```jsx
import { useState } from 'react'
import Spinner from '../ui/Spinner'

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('')

  function submit(e) {
    e.preventDefault()
    const v = text.trim()
    if (!v || disabled) return
    onSend(v)
    setText('')
  }

  return (
    <form onSubmit={submit} className="flex gap-2 items-center">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Plan my week..."
        disabled={disabled}
        className="flex-1 bg-ivory-3 border border-line rounded-xl px-3.5 py-2.5 text-[13px] text-ink focus:outline-none focus:border-maroon placeholder:text-mute2"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="w-9 h-9 bg-gradient-to-br from-maroon to-maroon-dark rounded-xl text-white text-sm shadow-[0_4px_12px_rgba(139,30,48,0.2)] disabled:opacity-50 flex items-center justify-center"
      >
        {disabled ? <Spinner size={16} /> : '↑'}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ai/ChatInput.jsx
git commit -m "feat: add ChatInput component"
```

---

### Task 33: AIScreen — wire chat with memory

**Files:**
- Create: `src/screens/AIScreen.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `src/screens/AIScreen.jsx`**

```jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import ChatMessage from '../components/ai/ChatMessage'
import ChatInput from '../components/ai/ChatInput'
import MemoryBar from '../components/ai/MemoryBar'
import { useChat } from '../hooks/useChat'
import { useGoals } from '../hooks/useGoals'
import { useTemplates } from '../hooks/useTemplates'
import { useTasksForDate, useTasksInRange, useTaskActions } from '../hooks/useTasks'
import { chat as askGemini, resolveDateKeyword } from '../lib/gemini'
import { todayISO, weekDays, isoFromDate, lastNDays } from '../lib/dates'

export default function AIScreen() {
  const today = todayISO()
  const { messages, appendMessage, clearHistory } = useChat()
  const { goals } = useGoals()
  const { templates } = useTemplates()
  const { tasks: todayTasks } = useTasksForDate(today)
  const days7 = useMemo(() => lastNDays(7), [])
  const weekTasks = useTasksInRange(days7[0], days7[6])
  const { createTask } = useTaskActions()

  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState(null)
  const [addedMap, setAddedMap] = useState({}) // { `${messageId}:${idx}`: true }
  const scrollRef = useRef(null)

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, thinking])

  // Build memory chips
  const memoryChips = useMemo(() => {
    const chips = []
    for (const g of goals.filter((g) => g.status === 'active').slice(0, 3)) {
      chips.push(g.title)
    }
    for (const t of templates.slice(0, 2)) {
      chips.push(t.name)
    }
    return chips
  }, [goals, templates])

  // Compute completion summary
  const completionSummary = useMemo(() => {
    const byDate = {}
    for (const t of weekTasks) {
      if (!byDate[t.date]) byDate[t.date] = []
      byDate[t.date].push(t)
    }
    const days = Object.values(byDate).filter((l) => l.length > 0)
    if (!days.length) return { weekPct: 0, deltaPct: 0, streak: 0 }
    const weekPct = Math.round(
      days.reduce((s, l) => s + l.filter((t) => t.completed).length / l.length, 0) * 100 / days.length
    )
    return { weekPct, deltaPct: 0, streak: 0 }
  }, [weekTasks])

  async function handleSend(text) {
    setError(null)
    await appendMessage({ role: 'user', content: text })
    setThinking(true)
    try {
      const history = messages
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }))
      const context = {
        todayISO: today,
        weekDates: weekDays().map(isoFromDate),
        goals: goals.filter((g) => g.status === 'active'),
        templates,
        todayTasks,
        recentCompletion: completionSummary,
      }
      const response = await askGemini({ history, userMessage: text, context })
      const suggestions = (response.suggestions || []).map((s) => ({
        ...s,
        resolvedDate: resolveDateKeyword(s.date) || today,
      }))
      await appendMessage({
        role: 'assistant',
        content: response.text || '',
        suggestions: suggestions.length ? suggestions : null,
      })
    } catch (e) {
      console.error(e)
      setError(e.message || 'Failed to reach Gemini')
    } finally {
      setThinking(false)
    }
  }

  async function handleAddSuggestion(messageId, idx, suggestion) {
    const key = `${messageId}:${idx}`
    if (addedMap[key]) return
    setAddedMap((m) => ({ ...m, [key]: true }))
    try {
      await createTask({
        name: suggestion.name,
        time: suggestion.time,
        date: suggestion.resolvedDate || today,
      })
    } catch (e) {
      setAddedMap((m) => ({ ...m, [key]: false }))
      setError('Failed to add task')
    }
  }

  return (
    <div className="flex flex-col h-full pt-1">
      <div className="flex items-center gap-2 mb-3.5">
        <div className="w-8 h-8 bg-gradient-to-br from-maroon to-maroon-dark rounded-xl flex items-center justify-center text-white text-base">✦</div>
        <div className="flex-1">
          <div className="font-serif text-[22px] text-ink leading-tight">AI Planner</div>
          <div className="text-[10px] text-mute font-light">Powered by Gemini</div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-[10px] text-mute uppercase tracking-wider"
          >
            Clear
          </button>
        )}
      </div>

      <MemoryBar chips={memoryChips} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="text-center text-mute text-sm py-10">
            Hi! I can help you plan your day or week.<br />
            Try: <span className="text-maroon-deep">"Plan my evening for SQL practice"</span>
          </div>
        )}
        {messages.map((m) => (
          <ChatMessage
            key={m.id}
            message={{
              ...m,
              suggestions: m.suggestions?.map((s, i) => ({
                ...s,
                added: !!addedMap[`${m.id}:${i}`],
              })),
            }}
            onAddSuggestion={(s, i) => handleAddSuggestion(m.id, i, s)}
          />
        ))}
        {thinking && (
          <div className="text-mute text-xs flex items-center gap-2 py-2">
            <span className="inline-block w-2 h-2 rounded-full bg-maroon animate-pulse" />
            Thinking…
          </div>
        )}
        {error && (
          <div className="text-red-700 text-xs py-2">{error}</div>
        )}
      </div>

      <div className="pt-2 pb-1">
        <ChatInput onSend={handleSend} disabled={thinking} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire into `src/App.jsx`**

Replace AI placeholder:

```jsx
import AIScreen from './screens/AIScreen'
// ...
<Route path="ai" element={<AIScreen />} />
```

- [ ] **Step 3: Manual test (requires real Gemini API key in `.env.local`)**

Run `npm run dev`. Unlock. Tap AI tab.
1. Memory bar shows your goal titles and template names
2. Type "Plan my evening for SQL" → spinner shows "Thinking…", then AI reply appears
3. If response includes suggestions, each has a "+" button → tap "+" → task is created (verify in Today tab)
4. Refresh page → chat history persists
5. Tap "Clear" → conversation resets

- [ ] **Step 4: Commit**

```bash
git add src/screens/AIScreen.jsx src/App.jsx
git commit -m "feat: wire AIScreen with Gemini chat, memory, and suggestion adding"
```

---

## Phase 9: PWA, Polish, Deploy

### Task 34: PWA manifest and Vite PWA plugin

**Files:**
- Create: `public/manifest.json`, `public/icon-192.png` (placeholder), `public/icon-512.png` (placeholder), `public/apple-touch-icon.png` (placeholder)
- Modify: `vite.config.js`, `index.html`

- [ ] **Step 1: Create `public/manifest.json`**

```json
{
  "name": "Daily Planner",
  "short_name": "Planner",
  "description": "Your daily timetable, goals, and AI planner",
  "theme_color": "#8b1e30",
  "background_color": "#faf8f6",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/",
  "scope": "/",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

- [ ] **Step 2: Generate placeholder icons**

Run from project root:

```bash
node -e "
const fs = require('fs');
const sizes = [192, 512];
for (const s of sizes) {
  const svg = \`<svg xmlns='http://www.w3.org/2000/svg' width='\${s}' height='\${s}' viewBox='0 0 \${s} \${s}'><rect width='\${s}' height='\${s}' fill='%238b1e30'/><text x='50%' y='52%' font-family='serif' font-size='\${s*0.5}' fill='%23faf8f6' text-anchor='middle' dominant-baseline='central'>P</text></svg>\`;
  console.log('Save manually:', svg.length, 'bytes for', s);
}
"
```

Actually — easier approach: use ImageMagick or a one-time HTML-to-PNG step. For now, create simple SVG-based PNG placeholders:

```bash
# Install librsvg if not present (macOS):
brew install librsvg 2>/dev/null || true

# Generate SVG sources
cat > /tmp/icon.svg << 'SVG'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#8b1e30"/>
  <text x="256" y="320" font-family="serif" font-size="280" fill="#faf8f6" text-anchor="middle">P</text>
</svg>
SVG

# Convert to PNG (use whichever is installed)
if command -v rsvg-convert >/dev/null; then
  rsvg-convert -w 192 -h 192 /tmp/icon.svg -o public/icon-192.png
  rsvg-convert -w 512 -h 512 /tmp/icon.svg -o public/icon-512.png
  rsvg-convert -w 180 -h 180 /tmp/icon.svg -o public/apple-touch-icon.png
elif command -v convert >/dev/null; then
  convert -background none /tmp/icon.svg -resize 192x192 public/icon-192.png
  convert -background none /tmp/icon.svg -resize 512x512 public/icon-512.png
  convert -background none /tmp/icon.svg -resize 180x180 public/apple-touch-icon.png
else
  echo "Install librsvg or ImageMagick to generate icons, or replace with real assets manually."
fi
```

If neither tool is installed, use any 512x512 PNG with the brand color — the manifest will still work.

- [ ] **Step 3: Add manifest link to `index.html`**

Inside `<head>`:

```html
<link rel="manifest" href="/manifest.json" />
```

- [ ] **Step 4: Configure `vite.config.js`** with PWA plugin

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: false, // Use static /manifest.json
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],
})
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: build succeeds; output mentions `sw.js` and `workbox-*.js`.

- [ ] **Step 6: Commit**

```bash
git add public/ vite.config.js index.html
git commit -m "feat: add PWA manifest, icons, and service worker"
```

---

### Task 35: Firestore security rules + setup notes

**Files:**
- Create: `firestore.rules`
- Modify: `README.md`

- [ ] **Step 1: Create `firestore.rules`**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Single-user app behind a passcode wall. Restrict to authenticated requests if you
    // wire Firebase Auth later. For now, deny direct external writes by requiring a custom
    // header or rely on app-only access via the API key + Firestore Database security panel.
    //
    // For personal use, the simplest acceptable setup is:
    //   - Set Firestore to "Test mode" if you're the only user
    //   - OR add Firebase Auth (anonymous) and check `request.auth != null`
    //
    // The rules below assume anonymous Firebase Auth (recommended).
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

- [ ] **Step 2: Append to `README.md`** with setup steps

Add this section:

```markdown
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
```

- [ ] **Step 3: Wire anonymous auth into `src/firebase.js`**

Replace `src/firebase.js`:

```js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(config)
export const db = getFirestore(app)
export const auth = getAuth(app)

// Auto sign-in anonymously so Firestore rules `request.auth != null` work.
// Promise resolves once signed in; pre-Firestore calls should await `firebaseReady`.
export const firebaseReady = new Promise((resolve) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      resolve(user)
    } else {
      signInAnonymously(auth).catch((e) => {
        console.error('Anonymous sign-in failed:', e)
        resolve(null)
      })
    }
  })
})
```

- [ ] **Step 4: Block Firestore hooks until auth ready — modify `src/App.jsx`**

Add at the top:

```jsx
import { useEffect, useState } from 'react'
import { firebaseReady } from './firebase'
```

Inside `App` component, before the auth check:

```jsx
const [fbReady, setFbReady] = useState(false)
useEffect(() => { firebaseReady.then(() => setFbReady(true)) }, [])
```

And before returning routes, gate on:

```jsx
if (!fbReady) {
  return <div className="min-h-full flex items-center justify-center text-mute">Loading…</div>
}
```

- [ ] **Step 5: Commit**

```bash
git add firestore.rules README.md src/firebase.js src/App.jsx
git commit -m "feat: add Firestore rules, anonymous auth, and setup docs"
```

---

### Task 36: Final polish — viewport safe-area, scroll behavior, empty states

**Files:**
- Modify: `src/components/layout/AppShell.jsx`, `src/index.css`

- [ ] **Step 1: Improve `src/index.css` for iOS overscroll and notch safety**

Add at the bottom of `@layer base`:

```css
@layer base {
  /* Prevent iOS rubber-band overscroll feel on the body */
  html { overscroll-behavior-y: none; }
  /* Stop double-tap zoom on buttons */
  button { touch-action: manipulation; }
}
```

- [ ] **Step 2: Update `AppShell.jsx` to handle iOS safe-area properly**

```jsx
import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function AppShell() {
  return (
    <div className="min-h-full flex justify-center bg-ivory-2">
      <div className="w-full max-w-[480px] min-h-screen flex flex-col bg-ivory shadow-[0_0_60px_rgba(0,0,0,0.04)]">
        <main className="flex-1 overflow-y-auto px-5 pt-[max(1rem,env(safe-area-inset-top))] no-scrollbar">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/index.css src/components/layout/AppShell.jsx
git commit -m "polish: improve iOS safe-area handling and overscroll behavior"
```

---

### Task 37: Deploy to Vercel

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create `vercel.json`** with SPA rewrites

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "chore: add vercel.json for SPA routing"
```

- [ ] **Step 3: Push to GitHub** (manual — user creates the repo)

```bash
# User runs:
gh repo create weekly-planner --public --source=. --remote=origin --push
# or, if already created:
git remote add origin git@github.com:<user>/weekly-planner.git
git push -u origin main
```

- [ ] **Step 4: Deploy to Vercel** (manual)

1. Go to https://vercel.com/new
2. Import the GitHub repo
3. Framework Preset: Vite
4. Add all `VITE_*` env vars from `.env.local`
5. Deploy

- [ ] **Step 5: Test the deployed PWA on iPhone**

1. Open the Vercel URL on iPhone Safari
2. Tap Share → "Add to Home Screen"
3. Verify icon and name appear correctly
4. Open from home screen — should launch in standalone mode
5. Test passcode unlock, add a task, view chart

---

## Self-Review Checklist

Run through this before claiming done:

- [ ] Every spec section has a corresponding task (passcode, Today + week strip, Add Task, Templates, Goals, Progress + history, AI with memory)
- [ ] Tailwind colors match spec exactly (#8b1e30, #faf8f6, etc.)
- [ ] Fonts match spec (Instrument Serif + DM Sans)
- [ ] Four Firestore collections wired: `tasks`, `templates`, `goals`, `chatMessages`
- [ ] Template auto-population is idempotent (no duplicates on reload)
- [ ] Past days hidden in week strip
- [ ] Swipe-to-reschedule works on mobile (test in Chrome DevTools mobile mode)
- [ ] AI memory includes goals, templates, today's tasks, completion summary, chat history
- [ ] Suggestion "+" buttons create tasks and turn green when added
- [ ] PWA manifest + service worker present
- [ ] Anonymous Firebase Auth wires before any Firestore call
- [ ] No `Co-Authored-By` lines in any commit messages
- [ ] `.env.local` is gitignored, only `.env.example` is committed

---

## Execution Notes

- Each task ends with a commit. Total ~37 commits for a clean, readable GitHub history that demonstrates incremental, professional engineering practice.
- Tasks within a phase can be executed in parallel by separate subagents only if you confirm there are no dependencies. Default to sequential.
- Manual UI tests are noted at integration points. Run `npm run dev` and verify in browser before committing.
- The Gemini system prompt may need tuning after first use. Adjust in `src/lib/gemini.js` if AI responses don't include suggestions consistently.
