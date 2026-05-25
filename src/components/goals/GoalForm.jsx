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
            <div className="flex items-baseline justify-between mb-1.5">
              <label className="text-[10px] tracking-[1.5px] uppercase text-mute">Target Date <span className="text-mute2 normal-case tracking-normal">(optional)</span></label>
              {targetDate && (
                <button
                  type="button"
                  onClick={() => setTargetDate('')}
                  className="text-[10px] text-maroon-deep tracking-wide"
                >
                  Clear
                </button>
              )}
            </div>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-ivory-3 border border-line rounded-xl px-3.5 text-sm text-ink focus:outline-none focus:border-maroon"
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
