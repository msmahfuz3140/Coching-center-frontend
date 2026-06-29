'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { authClient } from '@/lib/auth-client'

export default function Sidebar() {
  const pathname = usePathname()
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

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

  useEffect(() => {
    if (!session?.user) return

    async function fetchUnread() {
      try {
        const res = await fetch('/api/notifications?limit=1')
        if (!res.ok) return
        const data = await res.json()
        setUnreadCount(data.unreadCount || 0)
      } catch {
        // ignore
      }
    }

    fetchUnread()
    const interval = setInterval(fetchUnread, 15000)
    return () => clearInterval(interval)
  }, [session?.user])

  const isAdmin = session?.user?.role === 'ADMIN'

  const studentMenu = [
    { href: '/dashboard', label: 'Dashboard', icon: 'home' },
    { href: '/dashboard/courses', label: 'My Courses', icon: 'book' },
    { href: '/dashboard/notifications', label: 'Notifications', icon: 'bell', badge: unreadCount },
    { href: '/dashboard/notices', label: 'Notices', icon: 'megaphone' },
    { href: '/dashboard/assignments', label: 'Assignments', icon: 'clipboard' },
    { href: '/dashboard/profile', label: 'Profile', icon: 'user' },
  ]

  const adminMenu = [
    { href: '/admin', label: 'Admin Dashboard', icon: 'settings' },
    { href: '/admin/users', label: 'Manage Users', icon: 'users' },
    { href: '/admin/courses', label: 'Manage Courses', icon: 'book-open' },
    { href: '/admin/enrollments', label: 'Enrollments', icon: 'check-circle' },
    { href: '/admin/notices', label: 'Notices', icon: 'bell' },
    { href: '/dashboard/profile', label: 'Profile', icon: 'user' },
  ]

  const menuItems = isAdmin ? adminMenu : studentMenu

  const getIcon = (icon: string) => {
    const icons: Record<string, string> = {
      home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      settings: 'M12 8V4m0 0L8 8m4-4l4 4M4 12h16M4 12l4 4m-4-4l4-4',
      users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      'book-open': 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      'check-circle': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      megaphone: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
    }
    return icons[icon] || icons.home
  }

  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileOpen])

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed bottom-6 left-6 z-40 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-blue-600/50 hover:scale-110 transition-all duration-300 flex items-center justify-center"
        aria-label="Toggle menu"
      >
        <svg className={`w-6 h-6 transition-transform duration-300 ${isMobileOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-40 h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white transition-all duration-300 ease-in-out ${isCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'translate-x-0 w-72'} ${isMobileOpen ? 'translate-x-0' : ''}`}>
        {/* Collapse Toggle - Desktop Only */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full p-1.5 shadow-lg hover:shadow-blue-600/50 hover:scale-110 transition-all duration-200 hidden md:block z-10"
          aria-label="Toggle sidebar"
        >
          <svg className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        {/* Logo Section */}
        <div className={`p-5 border-b border-gray-700/50 ${isCollapsed ? 'text-center' : ''}`}>
          <div className="flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
            </div>
            {!isCollapsed && (
              <div className="animate-fadeIn">
                <h2 className="font-bold text-base bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">PECC LMS</h2>
                <p className="text-xs text-gray-400 font-medium">{isAdmin ? '⚙️ Admin Panel' : '📚 Student Portal'}</p>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        {!isLoading && session?.user && !isCollapsed && (
          <div className="px-4 py-3 border-b border-gray-700/50">
            <div className="flex items-center space-x-3 bg-gray-800/50 rounded-xl p-2.5">
              <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-blue-500/50 flex-shrink-0">
                {session?.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{session.user.name || 'User'}</p>
                <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const badge = 'badge' in item ? item.badge : 0
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                  }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className={`relative ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getIcon(item.icon)} />
                  </svg>
                </div>
                {!isCollapsed && (
                  <>
                    <span className={`text-sm font-medium flex-1 ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                    {typeof badge === 'number' && badge > 0 && (
                      <span className="min-w-[1.5rem] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    )}
                  </>
                )}
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-700/50 p-3 space-y-2">
          {/* View Profile Link */}
          <Link
            href="/dashboard/profile"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 rounded-xl bg-gray-800/30 hover:bg-gray-800 px-3 py-2.5 text-sm font-medium text-gray-200 hover:text-white transition-all duration-200 group"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-gray-600 group-hover:ring-blue-500 transition-all duration-200 flex-shrink-0">
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && <span className="group-hover:translate-x-1 transition-transform duration-200">View Profile</span>}
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden w-full py-2.5 text-center text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200"
          >
            ✕ Close Menu
          </button>
        </div>
      </aside>
    </>
  )
}