import { useAuth } from './hooks/useAuth'
import PasscodeScreen from './screens/PasscodeScreen'

export default function App() {
  const { authed, tryUnlock, lock } = useAuth()
  if (!authed) return <PasscodeScreen onSubmit={tryUnlock} />
  return (
    <div className="min-h-full flex flex-col items-center justify-center gap-4">
      <h1 className="font-serif text-4xl text-maroon">Unlocked</h1>
      <button onClick={lock} className="text-mute underline">Log out</button>
    </div>
  )
}
