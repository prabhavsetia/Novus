import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { firebaseReady } from './firebase'
import PasscodeScreen from './screens/PasscodeScreen'
import AppShell from './components/layout/AppShell'
import TodayScreen from './screens/TodayScreen'
import PlanScreen from './screens/PlanScreen'
import ProgressScreen from './screens/ProgressScreen'
import AIScreen from './screens/AIScreen'

export default function App() {
  const { authed, tryUnlock } = useAuth()
  const [fbReady, setFbReady] = useState(false)

  useEffect(() => { firebaseReady.then(() => setFbReady(true)) }, [])

  if (!authed) return <PasscodeScreen onSubmit={tryUnlock} />

  if (!fbReady) {
    return (
      <div className="min-h-full flex items-center justify-center text-mute text-sm">
        Connecting…
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<TodayScreen />} />
        <Route path="plan" element={<PlanScreen />} />
        <Route path="progress" element={<ProgressScreen />} />
        <Route path="ai" element={<AIScreen />} />
      </Route>
    </Routes>
  )
}
