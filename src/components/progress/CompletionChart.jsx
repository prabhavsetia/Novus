import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'

// data: [{ label: 'Mon', value: 60, iso: '2026-05-19' }, ...]
export default function CompletionChart({ data }) {
  return (
    <div className="bg-maroon/[0.03] border border-maroon/[0.08] rounded-2xl p-4 pb-2 mb-3">
      <div className="text-[10px] uppercase tracking-[1.5px] text-mute mb-3 font-normal">
        Daily Completion Rate
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b1e30" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#8b1e30" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e0d8d2" strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: '#c0b8b0' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tick={{ fontSize: 9, fill: '#c0b8b0' }}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8b1e30"
              strokeWidth={2}
              fill="url(#areaFill)"
              dot={{ r: 3, fill: '#faf8f6', stroke: '#8b1e30', strokeWidth: 1.5 }}
              activeDot={{ r: 4 }}
              isAnimationActive={true}
              animationDuration={400}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
