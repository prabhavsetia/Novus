import { useState } from 'react'
import Spinner from '../ui/Spinner'

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('')

  function submit(e) {
    e.preventDefault()
    const v = text.trim()
    if (!v || disabled) return
    onSend(v)
    setText('')
  }

  return (
    <form onSubmit={submit} className="flex gap-2 items-center">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Plan my week..."
        disabled={disabled}
        className="flex-1 bg-ivory-3 border border-line rounded-xl px-3.5 py-2.5 text-[13px] text-ink focus:outline-none focus:border-maroon placeholder:text-mute2"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="w-9 h-9 bg-gradient-to-br from-maroon to-maroon-dark rounded-xl text-white text-sm shadow-[0_4px_12px_rgba(139,30,48,0.2)] disabled:opacity-50 flex items-center justify-center"
      >
        {disabled ? <Spinner size={16} /> : '↑'}
      </button>
    </form>
  )
}
