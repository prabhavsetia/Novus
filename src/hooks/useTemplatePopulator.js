import { useEffect, useRef } from 'react'
import {
  collection, query, where, getDocs, serverTimestamp, writeBatch, doc
} from 'firebase/firestore'
import { db } from '../firebase'
import { dateFromISO, dayKey } from '../lib/dates'

// For a given date, ensures any matching templates have populated their tasks.
// Idempotent: it checks for existing tasks with the same (fromTemplate, date) before adding.
export function useTemplatePopulator(dateISO, templates, ready = true) {
  const ran = useRef(new Set())

  useEffect(() => {
    if (!ready || !dateISO || !templates) return
    const day = dayKey(dateFromISO(dateISO))
    const matching = templates.filter((t) => Array.isArray(t.days) && t.days.includes(day))
    if (!matching.length) return

    ;(async () => {
      const batch = writeBatch(db)
      let queued = 0
      for (const tpl of matching) {
        const key = `${dateISO}::${tpl.id}`
        if (ran.current.has(key)) continue
        const q = query(
          collection(db, 'tasks'),
          where('date', '==', dateISO),
          where('fromTemplate', '==', tpl.id)
        )
        const snap = await getDocs(q)
        if (snap.empty) {
          for (const item of (tpl.tasks || [])) {
            const ref = doc(collection(db, 'tasks'))
            batch.set(ref, {
              name: item.name,
              time: item.time,
              date: dateISO,
              completed: false,
              completedAt: null,
              fromTemplate: tpl.id,
              createdAt: serverTimestamp(),
            })
            queued++
          }
        }
        ran.current.add(key)
      }
      if (queued > 0) await batch.commit()
    })().catch((e) => console.error('template populate failed', e))
  }, [dateISO, templates, ready])
}
