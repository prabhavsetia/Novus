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
