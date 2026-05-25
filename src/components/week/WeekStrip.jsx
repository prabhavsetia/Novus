import { useMemo } from 'react'
import { cn } from '../../lib/classnames'
import {
  weekDays, isoFromDate, isPastDay, isTodayDate, formatShortDay, formatDayNum
} from '../../lib/dates'

export default function WeekStrip({ selectedISO, taskCounts = {}, onSelect }) {
  const days = useMemo(() => weekDays(new Date()), [])

  return (
    <div className="flex gap-1 mb-3.5 px-0.5">
      {days.map((d) => {
        const iso = isoFromDate(d)
        const past = isPastDay(d)
        const today = isTodayDate(d)
        const selected = iso === selectedISO
        const count = taskCounts[iso] || 0

        if (past) {
          return <div key={iso} className="flex-1 opacity-0 pointer-events-none" />
        }

        return (
          <button
            key={iso}
            onClick={() => onSelect(iso)}
            className={cn(
              'flex-1 flex flex-col items-center py-1.5 rounded-xl text-[10px] tracking-wide transition',
              today && selected && 'bg-maroon text-white/80',
              today && !selected && 'bg-maroon/10 text-maroon-deep',
              !today && selected && 'bg-maroon/[0.06] text-ink ring-1 ring-maroon/20',
              !today && !selected && 'text-mute',
            )}
          >
            <span>{formatShortDay(d)}</span>
            <span className={cn(
              'text-[15px] font-medium mt-0.5 leading-none',
              today && selected && 'text-white',
              today && !selected && 'text-maroon-deep',
              !today && 'text-ink',
            )}>{formatDayNum(d)}</span>
            {count > 0 && (
              <span className={cn(
                'text-[8px] mt-0.5',
                today && selected ? 'text-white/60' : 'text-mute2',
              )}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
