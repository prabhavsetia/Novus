import { useState } from 'react'
import Button from '../ui/Button'
import { todayISO } from '../../lib/dates'

export default function AddTaskForm({ defaultDate = todayISO(), onSave, onCancel }) {
  const [name, setName] = useState('')
  const [time, setTime] = useState('19:00')
  const [endTime, setEndTime] = useState('')
  const [date, setDate] = useState(defaultDate)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !time) return
    setSaving(true)
    try {
      await onSave({ name: name.trim(), time, endTime: endTime || null, date })
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] tracking-[1.5px] uppercase text-mute mb-1.5 block">Start</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-ivory-3 border border-line rounded-xl px-3.5 text-sm text-ink focus:outline-none focus:border-maroon"
              />
            </div>
            <div>
              <label className="text-[10px] tracking-[1.5px] uppercase text-mute mb-1.5 block">End <span className="text-mute2 normal-case tracking-normal">(optional)</span></label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-ivory-3 border border-line rounded-xl px-3.5 text-sm text-ink focus:outline-none focus:border-maroon"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] tracking-[1.5px] uppercase text-mute mb-1.5 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={todayISO()}
              className="w-full bg-ivory-3 border border-line rounded-xl px-3.5 text-sm text-ink focus:outline-none focus:border-maroon"
            />
          </div>

          <div className="pt-2 space-y-2">
            <Button type="submit" className="w-full" disabled={saving || !name.trim() || !time}>
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
