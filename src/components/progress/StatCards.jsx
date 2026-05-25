export default function StatCards({ weekPct, deltaPct }) {
  const deltaSign = deltaPct > 0 ? '↑' : deltaPct < 0 ? '↓' : '·'
  const deltaColor = deltaPct > 0 ? 'text-emerald-700' : deltaPct < 0 ? 'text-red-700' : 'text-maroon-deep'
  return (
    <div className="flex gap-2.5 mb-3">
      <div className="flex-1 bg-white border border-black/5 rounded-xl p-3 text-center shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
        <div className="font-serif text-2xl text-maroon-deep leading-none">{weekPct}%</div>
        <div className="text-[9px] uppercase tracking-[1.5px] text-mute mt-1 font-light">This Week</div>
      </div>
      <div className="flex-1 bg-white border border-black/5 rounded-xl p-3 text-center shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
        <div className={`font-serif text-2xl leading-none ${deltaColor}`}>
          {deltaSign} {Math.abs(deltaPct)}%
        </div>
        <div className="text-[9px] uppercase tracking-[1.5px] text-mute mt-1 font-light">vs Last Week</div>
      </div>
    </div>
  )
}
