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
