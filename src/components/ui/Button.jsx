import { cn } from '../../lib/classnames'

export default function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition active:scale-[0.98] select-none'
  const sizes = 'px-5 py-3 text-sm'
  const variants = {
    primary: 'bg-gradient-to-br from-maroon to-maroon-dark text-white shadow-[0_4px_14px_rgba(139,30,48,0.2)]',
    ghost: 'bg-transparent text-mute hover:text-ink',
    tonal: 'bg-maroon/10 text-maroon-deep border border-maroon/10',
  }
  return (
    <button
      type={type}
      className={cn(base, sizes, variants[variant], className)}
      {...props}
    />
  )
}
