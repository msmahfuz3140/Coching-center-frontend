'use client'

import NotificationBell from '@/components/NotificationBell'

export default function DashboardTopBar() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-end gap-3 border-b border-gray-100 bg-white/90 px-6 py-3 backdrop-blur-md">
      <NotificationBell />
    </header>
  )
}
