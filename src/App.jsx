import { Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import PasscodeScreen from './screens/PasscodeScreen'
import AppShell from './components/layout/AppShell'

function Placeholder({ name }) {
  return (
    <div className="py-10 text-center">
      <h2 className="font-serif text-2xl text-ink">{name}</h2>
      <p className="text-mute text-sm mt-2">Coming soon</p>
    </div>
  )
}

export default function App() {
  const { authed, tryUnlock } = useAuth()
  if (!authed) return <PasscodeScreen onSubmit={tryUnlock} />
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Placeholder name="Today" />} />
        <Route path="plan" element={<Placeholder name="Plan" />} />
        <Route path="progress" element={<Placeholder name="Progress" />} />
        <Route path="ai" element={<Placeholder name="AI" />} />
      </Route>
    </Routes>
  )
}
