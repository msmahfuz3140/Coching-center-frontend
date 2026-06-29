'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import NotificationBell from '@/components/NotificationBell'

export default function DashboardTopBar() {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const loadSession = async () => {
    try {
      const { data } = await authClient.getSession()
      setSession(data)
    } catch (error) {
      console.error('Failed to load session', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSession()
  }, [])

  const handleLogout = async () => {
    await authClient.signOut()
    setSession(null)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-gray-200/80 bg-white/95 px-4 sm:px-6 lg:px-8 py-3 backdrop-blur-md shadow-sm">
      {/* Mobile Menu Trigger - Shows sidebar toggle on mobile */}
      <div className="flex items-center gap-3 md:hidden">
        <span className="text-sm font-semibold text-gray-700">Menu</span>
      </div>

      {/* Desktop: Show page title or breadcrumb area */}
      <div className="hidden md:flex items-center gap-2 text-sm">
        <span className="text-gray-500">Welcome back,</span>
        {!isLoading && session?.user && (
          <span className="font-semibold text-gray-900">{session.user.name}</span>
        )}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        <NotificationBell />

        {!isLoading && session?.user && (
          <>
            {/* Profile Image - Desktop */}
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-blue-200 hover:ring-blue-400 transition-all duration-200">
                {session?.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt={session?.user?.name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="hidden lg:block px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                Sign Out
              </button>
            </div>

            {/* Profile Image - Mobile */}
            <div className="sm:hidden relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-blue-200">
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session?.user?.name || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  )
}
