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

// Format a start/end time pair. If both share the same AM/PM, only show it once.
// e.g. "07:00" + "08:30" → "7:00 — 8:30 AM"; "13:00" + "14:30" → "1:00 — 2:30 PM"
export function formatTimeRange12(startHHmm, endHHmm) {
  if (!startHHmm) return ''
  if (!endHHmm) return formatTime12(startHHmm)
  const [sh, sm] = startHHmm.split(':').map(Number)
  const [eh, em] = endHHmm.split(':').map(Number)
  const sp = sh >= 12 ? 'PM' : 'AM'
  const ep = eh >= 12 ? 'PM' : 'AM'
  const sh12 = ((sh + 11) % 12) + 1
  const eh12 = ((eh + 11) % 12) + 1
  const sStr = `${sh12}:${String(sm).padStart(2, '0')}`
  const eStr = `${eh12}:${String(em).padStart(2, '0')}`
  if (sp === ep) return `${sStr} – ${eStr} ${sp}`
  return `${sStr} ${sp} – ${eStr} ${ep}`
}

// Sort tasks by their HH:mm time string ascending
export function compareByTime(a, b) {
  return (a.time || '').localeCompare(b.time || '')
}

export function daysBetween(isoA, isoB) {
  return differenceInCalendarDays(parseISO(isoA), parseISO(isoB))
}
