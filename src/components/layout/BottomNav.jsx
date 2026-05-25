import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/classnames'

const ITEMS = [
  { to: '/', label: 'Today', icon: '◉', end: true },
  { to: '/plan', label: 'Plan', icon: '↻' },
  { to: '/progress', label: 'Progress', icon: '⟋' },
  { to: '/ai', label: 'AI', icon: '✦' },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden border-t border-black/5 bg-ivory grid grid-cols-4 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {ITEMS.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 py-1 text-[9px] uppercase tracking-[1.5px]',
              isActive ? 'text-maroon-deep' : 'text-mute2'
            )
          }
        >
          <span className="text-base leading-none">{it.icon}</span>
          {it.label}
        </NavLink>
      ))}
    </nav>
  )
}
