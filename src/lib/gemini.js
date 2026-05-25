import { GoogleGenerativeAI } from '@google/generative-ai'

let _client = null
function client() {
  if (_client) return _client
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key) throw new Error('Missing VITE_GEMINI_API_KEY')
  _client = new GoogleGenerativeAI(key)
  return _client
}

const MODEL = 'gemini-2.5-flash'

const SYSTEM_PROMPT = `You are a personal planning assistant inside a daily planner app. Your job: help the user plan their day or week, informed by their goals and recent progress.

RULES:
- Be concise. Speak in short paragraphs.
- When suggesting tasks, ALWAYS output them as a JSON block at the END of your response, like:
  \`\`\`json
  {"suggestions": [{"name": "Window functions practice", "time": "19:00", "endTime": "20:00", "date": "today"}, ...]}
  \`\`\`
- "time" must be 24hr HH:mm format (start time).
- "endTime" is OPTIONAL — include it when you can estimate a duration (e.g. a 1-hour study block). Same 24hr HH:mm format. Omit when the task is short / point-in-time.
- "date" must be either "today", "tomorrow", a weekday name ("monday", "tuesday", ...), or an explicit YYYY-MM-DD string.
- If a request needs no task suggestions (e.g. the user is asking a question), omit the JSON block entirely.
- Use the user's goals to make suggestions relevant. Reference their progress when motivating.
- Do not invent goals, templates, or completion stats that aren't in the context.`

function buildContextBlock({ goals, templates, todayTasks, recentCompletion, todayISO, weekDates }) {
  const lines = []
  lines.push(`Today's date: ${todayISO}`)
  lines.push(`This week: ${weekDates.join(', ')}`)
  if (goals?.length) {
    lines.push('\nActive goals:')
    for (const g of goals) {
      lines.push(`- ${g.title}${g.targetDate ? ` (target ${g.targetDate})` : ''}: ${g.description || '(no notes)'}`)
    }
  }
  if (templates?.length) {
    lines.push('\nRecurring templates:')
    for (const t of templates) {
      const tasks = (t.tasks || []).map((x) => {
        const tr = x.endTime ? `${x.time}-${x.endTime}` : x.time
        return `${tr} ${x.name}`
      }).join('; ')
      lines.push(`- ${t.name} [${(t.days || []).join(',')}]: ${tasks}`)
    }
  }
  if (todayTasks?.length) {
    lines.push("\nToday's tasks:")
    for (const t of todayTasks) {
      const tr = t.endTime ? `${t.time}-${t.endTime}` : t.time
      lines.push(`- [${t.completed ? 'x' : ' '}] ${tr} ${t.name}`)
    }
  }
  if (recentCompletion) {
    lines.push(`\nRecent completion: this week ${recentCompletion.weekPct}%, vs last week ${recentCompletion.deltaPct > 0 ? '+' : ''}${recentCompletion.deltaPct}%, ${recentCompletion.streak}-day streak`)
  }
  return lines.join('\n')
}

// history: [{ role: 'user'|'assistant', content: string }]
export async function chat({ history, userMessage, context }) {
  const model = client().getGenerativeModel({
    model: MODEL,
    systemInstruction: SYSTEM_PROMPT,
  })

  const contextBlock = buildContextBlock(context)

  // Gemini requires the first history entry to be 'user'. Trim leading assistant messages.
  let pruned = [...history]
  while (pruned.length && pruned[0].role !== 'user') pruned.shift()

  const geminiHistory = pruned.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const chatSession = model.startChat({ history: geminiHistory })

  const fullMessage = `[CONTEXT]\n${contextBlock}\n[/CONTEXT]\n\n${userMessage}`
  const result = await chatSession.sendMessage(fullMessage)
  const text = result.response.text()
  return parseResponse(text)
}

function parseResponse(raw) {
  const re = /```json\s*([\s\S]*?)```/g
  let suggestions = null
  let cleaned = raw
  const matches = [...raw.matchAll(re)]
  if (matches.length) {
    const last = matches[matches.length - 1]
    try {
      const parsed = JSON.parse(last[1].trim())
      if (Array.isArray(parsed.suggestions)) {
        suggestions = parsed.suggestions
        cleaned = raw.replace(last[0], '').trim()
      }
    } catch {
      // Ignore parse errors — leave raw text
    }
  }
  return { text: cleaned, suggestions }
}

export function resolveDateKeyword(keyword, todayDate = new Date()) {
  if (!keyword) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(keyword)) return keyword
  const lower = keyword.toLowerCase().trim()
  const fmt = (d) => d.toISOString().slice(0, 10)
  if (lower === 'today') return fmt(todayDate)
  if (lower === 'tomorrow') {
    const d = new Date(todayDate); d.setDate(d.getDate() + 1); return fmt(d)
  }
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
  const idx = days.indexOf(lower)
  if (idx >= 0) {
    const d = new Date(todayDate)
    const delta = (idx - d.getDay() + 7) % 7 || 7
    d.setDate(d.getDate() + delta)
    return fmt(d)
  }
  return null
}
