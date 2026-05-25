import { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { cn } from '../../lib/classnames'
import { formatTime12, formatTimeRange12 } from '../../lib/dates'

// tasksByDate: { 'YYYY-MM-DD': [task, task, ...] } — only past dates
export default function HistorySection({ tasksByDate }) {
  const [open, setOpen] = useState(false)
  const [expandedISO, setExpandedISO] = useState(null)

  const days = useMemo(() => {
    return Object.entries(tasksByDate)
      .map(([iso, list]) => {
        const done = list.filter((t) => t.completed).length
        return { iso, total: list.length, done, list }
      })
      .sort((a, b) => b.iso.localeCompare(a.iso))
  }, [tasksByDate])

  return (
    <div className="border-t border-black/5 pt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex justify-between items-center"
      >
        <div className="font-serif text-base text-ink">History</div>
        <div className={cn('text-mute text-xs transition', open && 'rotate-180')}>▼</div>
      </button>

      {open && (
        <div className="mt-2.5">
          {days.length === 0 && (
            <div className="text-mute text-sm py-3 text-center">No past days yet.</div>
          )}
          {days.map((d) => {
            const isExpanded = expandedISO === d.iso
            return (
              <div key={d.iso} className="border-b border-black/[0.03]">
                <button
                  onClick={() => setExpandedISO(isExpanded ? null : d.iso)}
                  className="w-full flex justify-between items-center py-2.5"
                >
                  <div className="text-[12px] text-ink">
                    {format(parseISO(d.iso), 'EEE, MMM d')}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[11px] text-mute font-light">{d.done} of {d.total} done</div>
                    <div className={cn('text-mute2 text-[10px] transition', isExpanded && 'rotate-90')}>›</div>
                  </div>
                </button>
                {isExpanded && (
                  <div className="pb-3 pl-2">
                    {d.list.length === 0 && (
                      <div className="text-mute text-xs">No tasks for this day.</div>
                    )}
                    {d.list
                      .slice()
                      .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                      .map((t) => (
                      <div key={t.id} className="flex items-center gap-2 py-1">
                        <div className={cn(
                          'w-3 h-3 rounded-[3px] border flex-shrink-0',
                          t.completed ? 'bg-maroon border-maroon' : 'border-mute2'
                        )} />
                        <div className={cn(
                          'flex-1 text-[12px]',
                          t.completed ? 'text-mute2 line-through' : 'text-ink'
                        )}>
                          {t.name}
                        </div>
                        <div className="text-[10px] text-mute tabular">{t.endTime ? formatTimeRange12(t.time, t.endTime) : formatTime12(t.time)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
