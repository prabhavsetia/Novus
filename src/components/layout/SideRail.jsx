import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/classnames'

const ITEMS = [
  { to: '/', label: 'Today', icon: '◉', end: true },
  { to: '/plan', label: 'Plan', icon: '↻' },
  { to: '/progress', label: 'Progress', icon: '⟋' },
  { to: '/ai', label: 'AI', icon: '✦' },
]

export default function SideRail() {
  return (
    <aside className="hidden md:flex flex-col w-[220px] lg:w-[260px] shrink-0 border-r border-black/5 bg-ivory px-5 py-8 sticky top-0 h-screen">
      <div className="mb-10">
        <div className="font-serif text-3xl text-maroon-deep leading-none tracking-tight">Novus</div>
        <div className="text-[9px] tracking-[3px] uppercase text-mute2 mt-1.5">v 1.0</div>
      </div>

      <nav className="flex flex-col gap-1">
        {ITEMS.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition',
                isActive
                  ? 'bg-maroon/[0.08] text-maroon-deep font-medium'
                  : 'text-mute hover:text-ink hover:bg-black/[0.02]'
              )
            }
          >
            <span className="text-base w-4 text-center">{it.icon}</span>
            {it.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto text-[10px] text-mute2 tracking-wide">
        Daily timetable · goals · AI
      </div>
    </aside>
  )
}
