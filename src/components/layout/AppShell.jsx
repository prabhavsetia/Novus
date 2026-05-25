import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import SideRail from './SideRail'

export default function AppShell() {
  return (
    <div className="min-h-full flex bg-ivory-2">
      {/* Desktop: persistent left rail with brand + nav */}
      <SideRail />

      {/* Mobile: phone-width centered column. Desktop: wide content beside the rail. */}
      <div className="flex-1 flex justify-center md:justify-start min-w-0">
        <div className="w-full max-w-[480px] md:max-w-[720px] lg:max-w-[820px] h-screen flex flex-col bg-ivory md:bg-transparent md:py-6 md:pl-8 md:pr-6 shadow-[0_0_60px_rgba(0,0,0,0.04)] md:shadow-none">
          <main className="flex-1 overflow-y-auto px-5 md:px-0 pt-[max(1rem,env(safe-area-inset-top))] md:pt-0 no-scrollbar">
            <Outlet />
          </main>
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
