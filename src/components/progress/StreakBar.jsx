function streakMessage(streak) {
  if (streak === 0) return 'Start one today!'
  if (streak === 1) return 'Day one — keep going'
  if (streak < 5) return 'Building momentum'
  if (streak < 10) return 'Strong streak — keep it alive'
  return "You're on fire"
}

export default function StreakBar({ streak }) {
  return (
    <div className="flex items-center gap-2.5 p-3 bg-gradient-to-br from-maroon/[0.06] to-maroon/[0.02] border border-maroon/10 rounded-xl mb-3">
      <div className="text-lg">🔥</div>
      <div className="flex-1">
        <div className="text-sm text-ink font-medium">{streak} day streak</div>
        <div className="text-[10px] text-mute font-light">{streakMessage(streak)}</div>
      </div>
    </div>
  )
}
