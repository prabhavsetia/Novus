export default function MemoryBar({ chips }) {
  if (!chips || chips.length === 0) return null
  return (
    <div className="flex items-center gap-1.5 p-2.5 bg-maroon/[0.04] border border-maroon/[0.08] rounded-xl mb-3 flex-wrap">
      <div className="text-[9px] text-maroon-deep font-medium uppercase tracking-[1px] mr-1">Memory:</div>
      {chips.map((chip, i) => (
        <div
          key={i}
          className="text-[9px] text-mute bg-white border border-line px-2 py-0.5 rounded-md"
        >
          {chip}
        </div>
      ))}
    </div>
  )
}
