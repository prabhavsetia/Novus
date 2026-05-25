import { useEffect, useState, useCallback } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

const COL = 'templates'

export function useTemplates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, COL), (snap) => {
      setTemplates(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, (err) => {
      console.error('useTemplates:', err)
      setLoading(false)
    })
    return unsub
  }, [])

  return { templates, loading }
}

export function useTemplateActions() {
  const createTemplate = useCallback(async ({ name, days, tasks }) => {
    return addDoc(collection(db, COL), {
      name,
      days,
      tasks,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }, [])

  const updateTemplate = useCallback(async (id, patch) => {
    await updateDoc(doc(db, COL, id), { ...patch, updatedAt: serverTimestamp() })
  }, [])

  const deleteTemplate = useCallback(async (id) => {
    await deleteDoc(doc(db, COL, id))
  }, [])

  return { createTemplate, updateTemplate, deleteTemplate }
}
