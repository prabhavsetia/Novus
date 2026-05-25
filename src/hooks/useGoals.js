import { useEffect, useState, useCallback } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

const COL = 'goals'

export function useGoals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, COL), (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      rows.sort((a, b) => {
        if (a.status !== b.status) return a.status === 'active' ? -1 : 1
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      })
      setGoals(rows)
      setLoading(false)
    }, (err) => {
      console.error('useGoals:', err)
      setLoading(false)
    })
    return unsub
  }, [])

  return { goals, loading }
}

export function useGoalActions() {
  const createGoal = useCallback(async ({ title, description, targetDate }) => {
    return addDoc(collection(db, COL), {
      title,
      description: description || '',
      targetDate: targetDate || null,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }, [])

  const updateGoal = useCallback(async (id, patch) => {
    await updateDoc(doc(db, COL, id), { ...patch, updatedAt: serverTimestamp() })
  }, [])

  const deleteGoal = useCallback(async (id) => {
    await deleteDoc(doc(db, COL, id))
  }, [])

  return { createGoal, updateGoal, deleteGoal }
}
