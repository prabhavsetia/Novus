import { cn } from '../../lib/classnames'

export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={cn(
        'bg-white border border-black/5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
