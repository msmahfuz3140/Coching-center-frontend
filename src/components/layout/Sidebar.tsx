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

  const isAdmin = session?.user?.role === 'ADMIN'

  const studentMenu = [
    { href: '/dashboard', label: 'Dashboard', icon: 'home' },
    { href: '/dashboard/courses', label: 'My Courses', icon: 'book' },
    { href: '/dashboard/notices', label: 'Notices', icon: 'bell' },
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
    }
    return icons[icon] || icons.home
  }

  return (
    <>
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <aside className={`fixed md:sticky top-0 left-0 z-30 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 ease-in-out ${isCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'translate-x-0 w-64'}`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 bg-gray-900 text-white rounded-full p-1 shadow-lg hover:bg-gray-700 transition-colors hidden md:block"
          aria-label="Toggle sidebar"
        >
          <svg className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        <div className={`p-4 border-b border-gray-700 ${isCollapsed ? 'text-center' : ''}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-sm">Coaching LMS</h2>
                <p className="text-xs text-gray-400">{isAdmin ? 'Admin Panel' : 'Student Portal'}</p>
              </div>
            )}
          </div>
        </div>

        {!isLoading && session?.user && !isCollapsed && (
          <div className="px-4 py-3 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">{session.user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{session.user.name || 'User'}</p>
                <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}
                title={isCollapsed ? item.label : undefined}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getIcon(item.icon)} />
                </svg>
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-gray-700 p-4">
          <Link href="/dashboard/profile" className="flex items-center gap-3 rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-gray-200 hover:bg-gray-700 transition-colors group">
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
            {!isCollapsed && <span>View Profile</span>}
          </Link>
        </div>

        <div className="md:hidden p-4 border-t border-gray-700">
          <button
            onClick={() => setIsCollapsed(true)}
            className="w-full py-2 text-center text-gray-400 hover:text-white transition-colors"
          >
            Close Menu
          </button>
        </div>
      </aside>
    </>
  )
}