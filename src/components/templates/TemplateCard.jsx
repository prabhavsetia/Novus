import Card from '../ui/Card'
import { formatTimeRange12 } from '../../lib/dates'

const DAY_LABELS = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }
const ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

function formatDays(days) {
  const sorted = ORDER.filter((d) => days?.includes(d))
  if (sorted.length === 0) return ''
  const set = new Set(sorted)
  if (sorted.length === 5 && ['mon','tue','wed','thu','fri'].every((d) => set.has(d))) return 'Mon – Fri'
  if (sorted.length === 2 && set.has('sat') && set.has('sun')) return 'Sat – Sun'
  if (sorted.length === 7) return 'Every day'
  return sorted.map((d) => DAY_LABELS[d]).join(', ')
}

export default function TemplateCard({ template, onEdit }) {
  const preview = (template.tasks || []).slice(0, 3)
  return (
    <Card className="p-4 mb-2.5 cursor-pointer" onClick={onEdit} role="button">
      <div className="flex justify-between items-center mb-2">
        <div className="text-[15px] font-medium text-ink">{template.name}</div>
        <div className="text-[10px] text-white bg-maroon px-2 py-0.5 rounded-md font-medium tracking-wide">
          {formatDays(template.days)}
        </div>
      </div>
      <div className="text-[11px] text-mute leading-relaxed font-light">
        {preview.map((t, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-mute2 flex-shrink-0" />
            <span>{formatTimeRange12(t.time, t.endTime)} — {t.name}</span>
          </div>
        ))}
        {(template.tasks?.length || 0) > 3 && (
          <div className="text-mute2 mt-1 italic">+ {template.tasks.length - 3} more</div>
        )}
      </div>
    </Card>
  )
}
