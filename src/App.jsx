import { Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import PasscodeScreen from './screens/PasscodeScreen'
import AppShell from './components/layout/AppShell'
import TodayScreen from './screens/TodayScreen'
import PlanScreen from './screens/PlanScreen'
import ProgressScreen from './screens/ProgressScreen'
import AIScreen from './screens/AIScreen'

export default function App() {
  const { authed, tryUnlock } = useAuth()
  if (!authed) return <PasscodeScreen onSubmit={tryUnlock} />
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
