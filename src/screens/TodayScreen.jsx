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
