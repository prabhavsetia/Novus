import { useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'planner.auth'

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const { ok } = JSON.parse(raw)
    return !!ok
  } catch {
    return false
  }
}

export function useAuth() {
  const [authed, setAuthed] = useState(() => readStored())

  const tryUnlock = useCallback((pin) => {
    const expected = import.meta.env.VITE_APP_PASSCODE
    if (pin === expected) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ok: true, ts: Date.now() })
      )
      setAuthed(true)
      return true
    }
    return false
  }, [])

  const lock = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAuthed(false)
  }, [])

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setAuthed(readStored())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return { authed, tryUnlock, lock }
}
