import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { cn } from '../../lib/classnames'
import { formatTime12, formatTimeRange12 } from '../../lib/dates'

export default function TaskRow({
  task,
  isCurrent = false,
  onToggle,
  onReschedule,
  onPickDate,
}) {
  const [revealed, setRevealed] = useState(false)

  const handlers = useSwipeable({
    onSwipedLeft: () => setRevealed(true),
    onSwipedRight: () => setRevealed(false),
    trackMouse: true,
    delta: 30,
  })

  const tomorrowISO = (() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  })()

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons revealed on swipe */}
      <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-1">
        <button
          onClick={() => { onReschedule(tomorrowISO); setRevealed(false) }}
          className="h-[calc(100%-12px)] my-1.5 px-3 rounded-lg text-[10px] font-semibold tracking-wider text-white bg-gradient-to-br from-maroon to-maroon-dark"
        >
          TMR
        </button>
        <button
          onClick={() => { onPickDate(); setRevealed(false) }}
          className="h-[calc(100%-12px)] my-1.5 px-3 rounded-lg text-[10px] font-semibold tracking-wider text-maroon-deep bg-maroon/10"
        >
          📅
        </button>
      </div>

      <div
        {...handlers}
        className={cn(
          'flex items-center gap-3 py-3 border-b border-black/[0.04] transition-transform bg-ivory',
          isCurrent && 'bg-maroon/[0.03] rounded-xl border-b-0 -mx-2 px-3 my-0.5',
        )}
        style={{ transform: revealed ? 'translateX(-120px)' : 'translateX(0)' }}
      >
        <button
          onClick={() => onToggle(!task.completed)}
          className={cn(
            'w-5 h-5 rounded-md border-[1.5px] flex-shrink-0 flex items-center justify-center transition',
            task.completed
              ? 'bg-gradient-to-br from-maroon to-maroon-dark border-maroon'
              : 'border-mute2'
          )}
        >
          {task.completed && <span className="text-white text-[10px] font-bold leading-none">✓</span>}
        </button>

        <div className="flex-1 min-w-0">
          <div className={cn(
            'text-sm leading-tight',
            task.completed ? 'text-mute2 line-through decoration-mute2' : 'text-ink'
          )}>
            {task.name}
          </div>
          {task.fromTemplate && (
            <div className="text-[10px] text-mute2 mt-0.5 tracking-wide flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-maroon" />
              template
            </div>
          )}
        </div>

        <div className={cn(
          'text-[11px] tabular flex-shrink-0 text-right leading-tight',
          isCurrent ? 'text-maroon-deep font-medium' : 'text-mute'
        )}>
          {task.endTime
            ? formatTimeRange12(task.time, task.endTime)
            : formatTime12(task.time)}
        </div>
      </div>
    </div>
  )
}
