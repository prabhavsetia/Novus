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
