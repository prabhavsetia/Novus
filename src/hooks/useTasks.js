import { useEffect, useState, useCallback } from 'react'
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

const COL = 'tasks'

// Subscribe to tasks for a specific date (YYYY-MM-DD)
export function useTasksForDate(dateISO) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!dateISO) return
    setLoading(true)
    const q = query(collection(db, COL), where('date', '==', dateISO))
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      rows.sort((a, b) => (a.time || '').localeCompare(b.time || ''))
      setTasks(rows)
      setLoading(false)
    }, (err) => {
      console.error('useTasksForDate:', err)
      setLoading(false)
    })
    return unsub
  }, [dateISO])

  return { tasks, loading }
}

// Subscribe to tasks across a range of dates (inclusive). Used by progress + history.
export function useTasksInRange(startISO, endISO) {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    if (!startISO || !endISO) return
    const q = query(
      collection(db, COL),
      where('date', '>=', startISO),
      where('date', '<=', endISO)
    )
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    }, (err) => {
      console.error('useTasksInRange:', err)
    })
    return unsub
  }, [startISO, endISO])

  return tasks
}

export function useTaskActions() {
  const createTask = useCallback(async ({ name, date, time, fromTemplate = null }) => {
    return addDoc(collection(db, COL), {
      name,
      date,
      time,
      completed: false,
      completedAt: null,
      fromTemplate,
      createdAt: serverTimestamp(),
    })
  }, [])

  const toggleComplete = useCallback(async (id, completed) => {
    await updateDoc(doc(db, COL, id), {
      completed,
      completedAt: completed ? serverTimestamp() : null,
    })
  }, [])

  const rescheduleTask = useCallback(async (id, newDateISO) => {
    await updateDoc(doc(db, COL, id), {
      date: newDateISO,
      completed: false,
      completedAt: null,
    })
  }, [])

  const deleteTask = useCallback(async (id) => {
    await deleteDoc(doc(db, COL, id))
  }, [])

  return { createTask, toggleComplete, rescheduleTask, deleteTask }
}
