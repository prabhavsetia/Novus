import { cn } from '../../lib/classnames'
import { formatTime12, formatTimeRange12 } from '../../lib/dates'
import { format, parseISO } from 'date-fns'

function formatDateChip(iso) {
  if (!iso) return ''
  try {
    return format(parseISO(iso), 'EEE MMM d')
  } catch {
    return iso
  }
}

export default function ChatMessage({ message, onAddSuggestion }) {
  const isUser = message.role === 'user'
  return (
    <div className={cn('mb-2 flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'max-w-[88%] px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl',
        isUser
          ? 'bg-maroon text-white rounded-br-md whitespace-pre-wrap'
          : 'bg-white text-ink border border-line rounded-bl-md'
      )}>
        {message.content && (
          <div className={cn(isUser ? '' : 'whitespace-pre-wrap')}>{message.content}</div>
        )}
        {!isUser && Array.isArray(message.suggestions) && message.suggestions.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {message.suggestions.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-maroon/[0.04] border border-maroon/10 rounded-lg px-2.5 py-2"
              >
                <div className="flex-1 text-[12px] text-ink truncate pr-2">{s.name}</div>
                <div className="text-[10px] text-mute mr-2 whitespace-nowrap">
                  {formatDateChip(s.resolvedDate)} · {s.endTime ? formatTimeRange12(s.time, s.endTime) : formatTime12(s.time)}
                </div>
                <button
                  onClick={() => onAddSuggestion(s, i)}
                  disabled={s.added}
                  className={cn(
                    'w-6 h-6 rounded-md flex items-center justify-center text-sm flex-shrink-0',
                    s.added ? 'bg-emerald-700 text-white' : 'bg-maroon text-white'
                  )}
                >
                  {s.added ? '✓' : '+'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
