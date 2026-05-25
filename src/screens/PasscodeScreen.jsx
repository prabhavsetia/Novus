import { useEffect, useState, useCallback } from 'react'
import { cn } from '../lib/classnames'

const KEYS = ['1','2','3','4','5','6','7','8','9','',  '0','del']

export default function PasscodeScreen({ onSubmit }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const press = useCallback((k) => {
    setError(false)
    if (k === 'del') {
      setPin((p) => p.slice(0, -1))
      return
    }
    if (k === '') return
    setPin((p) => (p.length >= 6 ? p : p + k))
  }, [])

  useEffect(() => {
    if (pin.length === 6) {
      const ok = onSubmit(pin)
      if (!ok) {
        setError(true)
        setTimeout(() => setPin(''), 400)
      }
    }
  }, [pin, onSubmit])

  // Hardware keyboard support
  useEffect(() => {
    function onKey(e) {
      if (/^[0-9]$/.test(e.key)) press(e.key)
      else if (e.key === 'Backspace') press('del')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [press])

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-8 py-12">
      <h1 className="font-serif text-5xl text-maroon-deep mb-1 tracking-tight">Novus</h1>
      <p className="text-mute2 text-[10px] mb-8 tracking-[3px] uppercase">v 1.0</p>
      <p className="text-mute text-sm mb-10 tracking-wide">Enter your PIN to continue</p>

      <div className={cn('flex gap-3 mb-12 transition', error && 'animate-pulse')}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-3.5 h-3.5 rounded-full border-[1.5px] transition',
              pin.length > i
                ? error
                  ? 'bg-red-500 border-red-500'
                  : 'bg-maroon border-maroon'
                : 'border-line'
            )}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((k, i) => (
          <button
            key={i}
            onClick={() => press(k)}
            disabled={k === ''}
            className={cn(
              'w-16 h-16 rounded-full text-xl text-ink',
              k === '' && 'opacity-0 pointer-events-none',
              k === 'del'
                ? 'bg-maroon/[0.06] border border-maroon/10 text-maroon text-base'
                : 'bg-ivory-3 border border-line active:bg-line'
            )}
          >
            {k === 'del' ? '⌫' : k}
          </button>
        ))}
      </div>
    </div>
  )
}
