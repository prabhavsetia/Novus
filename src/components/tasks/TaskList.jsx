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
