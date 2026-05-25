# Daily Planner — Design Spec

## Overview
A mobile-first PWA for personal daily task management. Users create timetable-style task lists with times, plan for today or the full week ahead, use recurring templates to auto-populate days, skip/reschedule tasks, track improvement via a daily completion line chart, and chat with a Gemini AI assistant to help plan their day or week. Primary device is iPhone (home screen install), but works on laptop and other devices via responsive design.

## Access
- 6-digit passcode screen (no usernames/signup)
- Passcode stored as env var `VITE_APP_PASSCODE` (value: `290500`)
- Session persists in localStorage after successful entry
- Works the same on any device — phone, tablet, laptop

## Screens

### 1. Passcode Screen
- App title "Daily Planner" in serif heading
- 6-digit numeric input with filled/empty dot indicators
- Round numpad buttons in a 3-column grid
- Backspace key to delete last digit
- Auto-submits on 6th digit
- On success: stores auth flag + timestamp in localStorage, navigates to Today

### 2. Today (Main Screen)
- **Week strip** at the top: horizontal row of 7 day pills (Mon–Sun) showing the current week
  - Today is highlighted with maroon fill
  - Tappable to view/plan any day of the current week
  - Future days show task count if tasks exist, empty if none yet
  - Past days (before today) are hidden — not selectable, not visible
- Header below strip: selected date in serif font (e.g. "May 25") + day of week in small caps + maroon "+" button to add task
- Progress ring: circular indicator showing "X of Y complete" with encouraging subtext
- Task list ordered by time:
  - Each task shows: checkbox, task name, optional "template" badge, time
  - Completed tasks: maroon checkbox with checkmark, strikethrough name, muted colors
  - Current/next task: subtle maroon background highlight, active time color
  - Pending tasks: empty checkbox, normal text
- Swipe left on any task reveals two actions:
  - "TMR" button (maroon gradient) — moves task to tomorrow
  - Calendar icon button — opens date picker to choose any future date
- **Day lifecycle**: once a day ends (midnight passes), its tasks are no longer visible on the Today screen. Task data is preserved in Firestore for the progress chart and history, but the UI only shows today and future days of the current week.
- Bottom navigation: Today (active) · Plan · Progress · AI

### 3. Add Task
- Triggered by "+" button on Today screen
- Fields:
  - Task name (required, text input)
  - Time (hour : minute : AM/PM selector)
  - Date (defaults to today, tappable to pick another date)
- "Save Task" maroon button
- "Cancel" text link below
- Task is added to the selected date's task list

### 4. Templates & Goals
This screen has two sections, toggled by a segmented control at the top: **Templates** | **Goals**

#### Templates Tab
- List of recurring routine cards, each showing:
  - Template name (e.g. "Weekday Routine")
  - Day badge (e.g. "Mon – Fri") in maroon pill
  - Preview list of tasks with times
- Each card is tappable to edit (add/remove/reorder tasks, change days)
- "+ New Template" maroon button at bottom
- When creating/editing a template:
  - Template name (text input)
  - Day selector (checkboxes for Mon–Sun)
  - Task list: each entry has name + time, can add/remove/reorder
- Templates auto-populate tasks each day based on matching day-of-week
- Auto-populated tasks are marked with a small maroon dot and "template" label
- Users can still add one-off tasks on top of template tasks

#### Goals Tab
- Where the user defines their study plan, career goals, or any long-term objectives
- Each goal is a card with:
  - Goal title (e.g. "SQL Mastery", "Learn Python for Data Analysis")
  - Description / notes (free-text, multi-line — what they want to achieve, resources, milestones)
  - Target date (optional — e.g. "June 30, 2026")
  - Status pill: Active / Completed
- Goals are stored in Firestore and persist across sessions
- "+ New Goal" maroon button at bottom
- The AI assistant reads all active goals to give contextual planning advice — this is the AI's "memory" of what the user is working toward
- Goals are NOT tied to daily tasks directly — they provide context and direction. The AI uses them to suggest relevant tasks.

- Bottom navigation: Today · Plan (active) · Progress · AI

### 5. Progress
- Header: "Progress" in serif + "Last 7 days" subtitle
- Line chart:
  - X-axis: days of the week (Mon–Sun)
  - Y-axis: completion percentage (0–100%)
  - Maroon line with area fill gradient underneath
  - Dots on each data point, solid dot on today
  - Daily completion rate = (tasks completed / total tasks) × 100
- Two stat cards below chart:
  - "This Week" — average completion % for current week
  - "vs Last Week" — percentage point change from previous week (↑ or ↓)
- Streak bar: fire emoji + "X day streak" + motivational subtext
  - Streak = consecutive days with ≥1 task completed
- **History section** (below streak bar):
  - Collapsed by default — "History" heading with expand/collapse chevron
  - When expanded: lists past days grouped by week, most recent first
  - Each day entry shows: date, completion count (e.g. "5 of 6 done"), and is tappable to see the full task list for that day (read-only, with completed/skipped status)
  - Data comes from the same Firestore `tasks` collection — just filtered to past dates
- Bottom navigation: Today · Plan · Progress (active) · AI

### 6. AI Assistant
- Chat interface powered by Gemini AI (Google Generative AI API)
- Purpose: help the user plan their day or week by suggesting tasks and schedule, informed by their goals and history
- Chat-style UI:
  - Message bubbles — user messages right-aligned, AI responses left-aligned
  - Text input at bottom with send button
  - AI responses styled in white bubble with warm border
- **AI memory — the AI knows about:**
  - The user's **active goals** (from Goals tab) — what they're studying, their targets, milestones
  - The user's **existing templates** — their daily routines
  - **Today's current task list** — what's done, what's pending
  - **Recent completion patterns** from progress data — how consistent they've been
  - **Chat history** — conversation is saved to Firestore so the AI remembers past planning discussions across sessions
- This means the AI can say things like "You mentioned you want to finish Kimball Ch. 3 by this week — want me to schedule reading sessions?" or "Your SQL goal target is June 15 and you've been averaging 2 problems/day — you're on track"
- **"Add to Planner" action**: when the AI suggests tasks, each suggestion has a tappable "+" button next to it that adds the task directly to Today or a specific day of the week
  - AI responses that contain task suggestions are parsed and rendered with inline add buttons
  - When tapped: task is created in Firestore with the suggested name/time/date
- API key stored as env var `VITE_GEMINI_API_KEY`
- Bottom navigation: Today · Plan · Progress · AI (active)

## Visual Design

### Aesthetic: "Refined Journal" — Light Maroon Theme
- **Background**: warm ivory (#faf8f6) with subtle grain texture overlay
- **Primary accent**: deep maroon (#8b1e30) for buttons, checkmarks, active states, chart
- **Secondary accent**: maroon gradient (135deg, #8b1e30 → #6e1526) for CTAs
- **Text**: dark warm brown (#2a2020) for primary, muted (#a09088) for secondary
- **Borders**: soft warm gray (#e0d8d2)
- **Cards**: white (#fff) with minimal shadow and 1px border
- **Headings**: Instrument Serif (display, editorial feel)
- **Body text**: DM Sans (clean, readable at small sizes)
- **Corners**: 10–14px border radius throughout
- **Shadows**: minimal, warm-toned (rgba(0,0,0,0.02–0.08))

### Responsive Behavior
- Mobile-first: max-width 480px centered layout
- On tablet/laptop: content area stays phone-width, centered on screen with the warm ivory background extending to edges
- Touch targets: minimum 44px for all interactive elements
- Bottom nav stays fixed at bottom on all screen sizes

## Data Model (Firestore)

### Collection: `tasks`
```
{
  id: string (auto),
  name: string,
  date: string (YYYY-MM-DD),
  time: string (HH:mm, 24hr format),
  completed: boolean,
  completedAt: timestamp | null,
  fromTemplate: string | null (template ID if auto-generated),
  createdAt: timestamp
}
```

### Collection: `templates`
```
{
  id: string (auto),
  name: string,
  days: string[] (e.g. ["mon", "tue", "wed", "thu", "fri"]),
  tasks: [
    { name: string, time: string (HH:mm) }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Collection: `goals`
```
{
  id: string (auto),
  title: string,
  description: string (free-text notes, milestones, resources),
  targetDate: string | null (YYYY-MM-DD, optional),
  status: string ("active" | "completed"),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Collection: `chatMessages`
```
{
  id: string (auto),
  role: string ("user" | "assistant"),
  content: string,
  suggestions: [
    { name: string, time: string, date: string }
  ] | null,
  createdAt: timestamp
}
```

### How Templates Populate Tasks
- On app load for a given date, check which templates match today's day-of-week
- For each matching template, check if tasks for that template + date already exist
- If not, create task documents from the template's task list with `fromTemplate` set
- This ensures tasks are only generated once per day and can be individually modified/deleted

### Rescheduling
- "Tomorrow" action: updates the task's `date` to next day, resets `completed` to false
- "Pick date" action: updates the task's `date` to chosen date, resets `completed` to false
- Rescheduled tasks appear in the target day's task list

### Progress Calculation
- Query tasks grouped by date for the last 14 days (current week + previous week for comparison)
- For each day: completion rate = completed tasks / total tasks
- Streak: count consecutive days backwards from today where at least 1 task was completed
- Week-over-week comparison: average of current 7 days vs previous 7 days

## Tech Stack
- React 18 + Vite
- Tailwind CSS
- Firebase Firestore (real-time sync via `onSnapshot`)
- Chart: Recharts (lightweight, React-native charting library)
- Swipe gestures: react-swipeable
- AI: Google Generative AI SDK (`@google/generative-ai`) — Gemini model
- Deployed on Vercel
- PWA: service worker + manifest for home screen installability on iPhone

## Firebase Config
All Firebase config values as Vite env vars:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_GEMINI_API_KEY`

## Deployment
- Vercel with `vite build` output
- Env vars configured in Vercel dashboard
- PWA manifest with maroon theme color (#8b1e30)
- Apple touch icon and splash screens for iPhone home screen install
