import { useState, useCallback } from 'react'

export function useAuth() {
  const [authed, setAuthed] = useState(false)

  const tryUnlock = useCallback((pin) => {
    const expected = import.meta.env.VITE_APP_PASSCODE
    if (pin === expected) {
      setAuthed(true)
      return true
    }
    return false
  }, [])

  const lock = useCallback(() => {
    setAuthed(false)
  }, [])

  return { authed, tryUnlock, lock }
}
