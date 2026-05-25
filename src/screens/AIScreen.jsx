import { useEffect, useMemo, useRef, useState } from 'react'
import ChatMessage from '../components/ai/ChatMessage'
import ChatInput from '../components/ai/ChatInput'
import MemoryBar from '../components/ai/MemoryBar'
import { useChat } from '../hooks/useChat'
import { useGoals } from '../hooks/useGoals'
import { useTemplates } from '../hooks/useTemplates'
import { useTasksForDate, useTasksInRange, useTaskActions } from '../hooks/useTasks'
import { chat as askGemini, resolveDateKeyword } from '../lib/gemini'
import { todayISO, weekDays, isoFromDate, lastNDays } from '../lib/dates'

export default function AIScreen() {
  const today = todayISO()
  const { messages, appendMessage, clearHistory } = useChat()
  const { goals } = useGoals()
  const { templates } = useTemplates()
  const { tasks: todayTasks } = useTasksForDate(today)
  const days7 = useMemo(() => lastNDays(7), [])
  const weekTasks = useTasksInRange(days7[0], days7[6])
  const { createTask } = useTaskActions()

  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState(null)
  const [addedMap, setAddedMap] = useState({})
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, thinking])

  const memoryChips = useMemo(() => {
    const chips = []
    for (const g of goals.filter((g) => g.status === 'active').slice(0, 3)) {
      chips.push(g.title)
    }
    for (const t of templates.slice(0, 2)) {
      chips.push(t.name)
    }
    return chips
  }, [goals, templates])

  const completionSummary = useMemo(() => {
    const byDate = {}
    for (const t of weekTasks) {
      if (!byDate[t.date]) byDate[t.date] = []
      byDate[t.date].push(t)
    }
    const days = Object.values(byDate).filter((l) => l.length > 0)
    if (!days.length) return { weekPct: 0, deltaPct: 0, streak: 0 }
    const weekPct = Math.round(
      days.reduce((s, l) => s + l.filter((t) => t.completed).length / l.length, 0) * 100 / days.length
    )
    return { weekPct, deltaPct: 0, streak: 0 }
  }, [weekTasks])

  async function handleSend(text) {
    setError(null)
    await appendMessage({ role: 'user', content: text })
    setThinking(true)
    try {
      const history = messages
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }))
      const context = {
        todayISO: today,
        weekDates: weekDays().map(isoFromDate),
        goals: goals.filter((g) => g.status === 'active'),
        templates,
        todayTasks,
        recentCompletion: completionSummary,
      }
      const response = await askGemini({ history, userMessage: text, context })
      const suggestions = (response.suggestions || []).map((s) => ({
        ...s,
        resolvedDate: resolveDateKeyword(s.date) || today,
      }))
      await appendMessage({
        role: 'assistant',
        content: response.text || '',
        suggestions: suggestions.length ? suggestions : null,
      })
    } catch (e) {
      console.error(e)
      setError(e.message || 'Failed to reach Gemini')
    } finally {
      setThinking(false)
    }
  }

  async function handleAddSuggestion(messageId, idx, suggestion) {
    const key = `${messageId}:${idx}`
    if (addedMap[key]) return
    setAddedMap((m) => ({ ...m, [key]: true }))
    try {
      await createTask({
        name: suggestion.name,
        time: suggestion.time,
        date: suggestion.resolvedDate || today,
      })
    } catch {
      setAddedMap((m) => ({ ...m, [key]: false }))
      setError('Failed to add task')
    }
  }

  return (
    <div className="flex flex-col h-full pt-1">
      <div className="flex items-center gap-2 mb-3.5">
        <div className="w-8 h-8 bg-gradient-to-br from-maroon to-maroon-dark rounded-xl flex items-center justify-center text-white text-base">✦</div>
        <div className="flex-1">
          <div className="font-serif text-[22px] text-ink leading-tight">AI Planner</div>
          <div className="text-[10px] text-mute font-light">Powered by Gemini</div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-[10px] text-mute uppercase tracking-wider"
          >
            Clear
          </button>
        )}
      </div>

      <MemoryBar chips={memoryChips} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="text-center text-mute text-sm py-10">
            Hi! I can help you plan your day or week.<br />
            Try: <span className="text-maroon-deep">"Plan my evening for SQL practice"</span>
          </div>
        )}
        {messages.map((m) => (
          <ChatMessage
            key={m.id}
            message={{
              ...m,
              suggestions: m.suggestions?.map((s, i) => ({
                ...s,
                added: !!addedMap[`${m.id}:${i}`],
              })),
            }}
            onAddSuggestion={(s, i) => handleAddSuggestion(m.id, i, s)}
          />
        ))}
        {thinking && (
          <div className="text-mute text-xs flex items-center gap-2 py-2">
            <span className="inline-block w-2 h-2 rounded-full bg-maroon animate-pulse" />
            Thinking…
          </div>
        )}
        {error && (
          <div className="text-red-700 text-xs py-2">{error}</div>
        )}
      </div>

      <div className="pt-2 pb-1">
        <ChatInput onSend={handleSend} disabled={thinking} />
      </div>
    </div>
  )
}
