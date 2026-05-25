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
  const days14 = useMemo(() => lastNDays(14), [])
  const start = days14[0]
  const end = days14[13]
  const tasks = useTasksInRange(start, end)

  const byDate = useMemo(() => bucketByDate(tasks), [tasks])

  const chartDays = days14.slice(7)
  const chartData = chartDays.map((iso) => ({
    label: format(parseISO(iso), 'EEE'),
    iso,
    value: pctForDay(byDate[iso]) ?? 0,
  }))

  const thisWeek = chartDays.map((iso) => pctForDay(byDate[iso])).filter((v) => v !== null)
  const lastWeek = days14.slice(0, 7).map((iso) => pctForDay(byDate[iso])).filter((v) => v !== null)
  const avg = (arr) => arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0
  const weekPct = avg(thisWeek)
  const lastPct = avg(lastWeek)
  const deltaPct = weekPct - lastPct

  const streak = useMemo(() => {
    let s = 0
    for (let i = chartDays.length - 1; i >= 0; i--) {
      const iso = chartDays[i]
      const list = byDate[iso] || []
      const anyDone = list.some((t) => t.completed)
      if (iso === today && list.length === 0) {
        continue
      }
      if (anyDone) s++
      else break
    }
    return s
  }, [chartDays, byDate, today])

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
