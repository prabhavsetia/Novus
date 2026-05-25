import Card from '../ui/Card'
import { cn } from '../../lib/classnames'
import { format, parseISO } from 'date-fns'

export default function GoalCard({ goal, onEdit }) {
  const active = goal.status === 'active'
  return (
    <Card className="p-4 mb-3 cursor-pointer" onClick={onEdit} role="button">
      <div className="flex items-start justify-between mb-2">
        <div className="text-[15px] font-medium text-ink leading-tight flex-1">{goal.title}</div>
        <span className={cn(
          'text-[9px] px-2 py-0.5 rounded-md font-medium uppercase tracking-wide ml-2 flex-shrink-0',
          active ? 'bg-maroon/10 text-maroon-deep' : 'bg-emerald-700/10 text-emerald-700'
        )}>
          {active ? 'Active' : 'Done'}
        </span>
      </div>
      {goal.description && (
        <div className="text-[12px] text-mute leading-relaxed font-light whitespace-pre-line mb-2">
          {goal.description}
        </div>
      )}
      {goal.targetDate && (
        <div className="flex items-center gap-1 text-[10px] text-maroon-deep">
          <span className="text-xs">◎</span>
          Target: {format(parseISO(goal.targetDate), 'MMM d, yyyy')}
        </div>
      )}
    </Card>
  )
}
