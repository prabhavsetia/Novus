import { cn } from '../../lib/classnames'

export default function Segmented({ value, onChange, options }) {
  return (
    <div className="flex bg-ivory-3 rounded-xl p-1 mb-4">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 py-2 rounded-lg text-sm font-medium tracking-wide transition',
            value === opt.value
              ? 'bg-white text-maroon-deep shadow-[0_1px_4px_rgba(0,0,0,0.06)]'
              : 'text-mute'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
