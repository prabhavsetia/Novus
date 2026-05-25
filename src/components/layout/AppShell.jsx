import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function AppShell() {
  return (
    <div className="min-h-full flex justify-center bg-ivory-2">
      <div className="w-full max-w-[480px] min-h-screen flex flex-col bg-ivory shadow-[0_0_60px_rgba(0,0,0,0.04)]">
        <main className="flex-1 overflow-y-auto px-5 pt-[max(1rem,env(safe-area-inset-top))] no-scrollbar">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
