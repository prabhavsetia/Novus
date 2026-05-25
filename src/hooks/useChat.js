import { useEffect, useState, useCallback } from 'react'
import {
  collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, getDocs
} from 'firebase/firestore'
import { db } from '../firebase'

const COL = 'chatMessages'
const LIMIT = 50

export function useChat() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, COL), orderBy('createdAt', 'asc'), limit(LIMIT))
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, (err) => {
      console.error('useChat:', err)
      setLoading(false)
    })
    return unsub
  }, [])

  const appendMessage = useCallback(async ({ role, content, suggestions = null }) => {
    return addDoc(collection(db, COL), {
      role,
      content,
      suggestions,
      createdAt: serverTimestamp(),
    })
  }, [])

  const clearHistory = useCallback(async () => {
    const snap = await getDocs(collection(db, COL))
    await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, COL, d.id))))
  }, [])

  return { messages, loading, appendMessage, clearHistory }
}
