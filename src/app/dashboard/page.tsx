'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { authClient } from '@/lib/auth-client'

interface Notice {
  id: string
  title: string
  content: string
  priority: string
  createdAt: string
  course: { id: string; title: string } | null
}

interface Enrollment {
  id: string
  status: string
  progress: number
  enrolledAt: string
  course: {
    id: string
    title: string
    category: string
    thumbnail?: string | null
  }
}

interface AppNotification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  course: { id: string; title: string; slug: string } | null
}

interface SessionUser {
  id: string
  name?: string | null
  email?: string
  role?: string
  image?: string | null
}

const priorityConfig: Record<string, { color: string; dot: string; label: string }> = {
  low: { color: 'bg-gray-100 text-gray-600 border border-gray-200', dot: 'bg-gray-400', label: 'Low' },
  normal: { color: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500', label: 'Normal' },
  high: { color: 'bg-orange-50 text-orange-700 border border-orange-200', dot: 'bg-orange-500', label: 'High' },
  urgent: { color: 'bg-red-50 text-red-700 border border-red-200', dot: 'bg-red-500', label: 'Urgent' },
}

const categoryLabels: Record<string, string> = {
  DIPLOMA: 'Diploma',
  DUET_TECH: 'DUET Tech',
  DUET_NON_TECH: 'DUET Non-Tech',
  SSC_9_10: 'SSC 9-10',
  POLYTECHNIC_ADMISSION: 'Polytechnic',
  REFERRED_BATCH: 'Referred',
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [notices, setNotices] = useState<Notice[]>([])
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function init() {
      try {
        const { data } = await authClient.getSession()
        if (!data) { router.push('/login'); return }
        setUser(data.user as SessionUser)

        const [noticeRes, enrollRes, notifRes] = await Promise.all([
          fetch('/api/notices'),
          fetch('/api/enrollments'),
          fetch('/api/notifications?limit=5'),
        ])
        const noticeData = await noticeRes.json()
        const enrollData = await enrollRes.json()
        const notifData = notifRes.ok ? await notifRes.json() : { notifications: [], unreadCount: 0 }

        if (noticeData.success) setNotices(noticeData.notices.slice(0, 4))
        if (Array.isArray(enrollData)) setEnrollments(enrollData.filter((e: Enrollment) => e.status === 'APPROVED').slice(0, 4))
        setNotifications(notifData.notifications || [])
        setUnreadCount(notifData.unreadCount || 0)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [router])

  const initials = (user?.name || 'U').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('')

  const approvedCount = enrollments.length
  const pendingCount = enrollments.filter(e => e.status === 'PENDING').length

  const stats = [
    {
      label: 'Enrolled Courses',
      value: approvedCount,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      href: '/dashboard/courses',
    },
    {
      label: 'Pending Enrollments',
      value: pendingCount,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      href: '/courses',
    },
    {
      label: 'Unread Notifications',
      value: unreadCount,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      gradient: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      href: '/dashboard/notifications',
    },
    {
      label: 'Recent Notices',
      value: notices.length,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      gradient: 'from-rose-500 to-red-500',
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      href: '/dashboard/notices',
    },
  ]

  const quickActions = [
    { href: '/dashboard/courses', icon: '📘', label: 'My Courses', desc: 'View enrolled courses', color: 'hover:border-blue-300 hover:bg-blue-50 group-hover:text-blue-600' },
    { href: '/dashboard/notifications', icon: '🔔', label: 'Notifications', desc: unreadCount > 0 ? `${unreadCount} unread updates` : 'Course updates & alerts', color: 'hover:border-red-300 hover:bg-red-50 group-hover:text-red-600' },
    { href: '/dashboard/assignments', icon: '📝', label: 'Assignments', desc: 'Check pending tasks', color: 'hover:border-purple-300 hover:bg-purple-50 group-hover:text-purple-600' },
    { href: '/dashboard/notices', icon: '🔔', label: 'Notices', desc: 'View announcements', color: 'hover:border-amber-300 hover:bg-amber-50 group-hover:text-amber-600' },
    { href: '/courses', icon: '🔍', label: 'Browse Courses', desc: 'Explore & enroll in courses', color: 'hover:border-emerald-300 hover:bg-emerald-50 group-hover:text-emerald-600' },
    { href: '/dashboard/profile', icon: '👤', label: 'My Profile', desc: 'Edit profile & settings', color: 'hover:border-indigo-300 hover:bg-indigo-50 group-hover:text-indigo-600' },
  ]

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin" />
            <p className="text-gray-500 font-medium">Loading your dashboard…</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Hero Banner ── */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #38bdf8 100%)' }}>
          {/* Decorative blobs */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute top-8 right-40 w-32 h-32 rounded-full bg-white/5" />

          <div className="relative px-6 sm:px-8 py-6 sm:py-8 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
              {/* Avatar */}
              <Link href="/dashboard/profile">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-white/40 bg-white/20 flex items-center justify-center font-black text-lg sm:text-xl text-white shadow-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer flex-shrink-0">
                  {user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
              </Link>

              <div className="min-w-0">
                <p className="text-blue-200 text-xs sm:text-sm font-medium tracking-wide">
                  {getGreeting()} 👋 · {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <h1 className="mt-1 text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight truncate max-w-full">
                  {user?.name || 'Student'}
                </h1>
                <p className="mt-1 text-blue-100 text-xs sm:text-sm max-w-md mx-auto sm:mx-0">
                  Track your progress, stay on top of notices, and keep learning! 🚀
                </p>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/courses"
              className="flex-shrink-0 inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-xs sm:text-sm w-full sm:w-auto"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Enroll in a Course
            </Link>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {stats.map((s) => (
            <Link key={s.label} href={s.href} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform flex-shrink-0`}>
                {s.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5 truncate">{s.label}</p>
              </div>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-blue-400 ml-auto transition-colors flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">

          {/* LEFT: My Courses */}
          <div className="space-y-4 sm:space-y-6">
            {/* Active Courses */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">📘 My Active Courses</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Courses you are enrolled in</p>
                </div>
                <Link href="/dashboard/courses" className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View all
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>

              {enrollments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-3 sm:mb-4">📚</div>
                  <p className="text-gray-700 font-semibold text-sm sm:text-base">No courses yet</p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">Browse and enroll in a course to get started</p>
                  <Link href="/courses" className="mt-3 sm:mt-4 inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                    Browse Courses →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {enrollments.map((e) => (
                    <div key={e.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0 shadow-md">
                        {categoryLabels[e.course.category]?.[0] || '📘'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-gray-900 break-words group-hover:text-blue-700 transition-colors">{e.course.title}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{categoryLabels[e.course.category] || e.course.category} · Enrolled {formatDate(e.enrolledAt)}</p>
                        <div className="mt-1.5 sm:mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1 sm:h-1.5">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1 sm:h-1.5 rounded-full transition-all" style={{ width: `${e.progress || 0}%` }} />
                          </div>
                          <span className="text-[10px] sm:text-xs font-semibold text-gray-500">{e.progress || 0}%</span>
                        </div>
                      </div>
                      <Link href="/dashboard/courses" className="flex-shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 bg-white border border-gray-200 text-blue-600 text-[10px] sm:text-xs font-semibold rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                        Continue
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Notifications */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">🔔 Recent Notifications</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {unreadCount > 0 ? `${unreadCount} unread — read to clear badge` : 'Latest course updates'}
                  </p>
                </div>
                <Link href="/dashboard/notifications" className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View all
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>

              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-2 sm:mb-3">🔔</div>
                  <p className="text-gray-500 text-xs sm:text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {notifications.map((n) => (
                    <Link
                      key={n.id}
                      href="/dashboard/notifications"
                      className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl transition-colors border ${!n.isRead ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-transparent hover:border-gray-200'
                        }`}
                    >
                      <span className="text-base sm:text-lg flex-shrink-0">{n.type === 'video' ? '🎬' : n.type === 'notice' ? '📢' : n.type === 'course_update' ? '📚' : '🔔'}</span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs sm:text-sm font-semibold break-words ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 break-words">{n.message}</p>
                      </div>
                      {!n.isRead && <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Notices */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">🔔 Recent Notices</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Latest announcements for you</p>
                </div>
                <Link href="/dashboard/notices" className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View all
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>

              {notices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-2 sm:mb-3">📭</div>
                  <p className="text-gray-500 text-xs sm:text-sm">No notices yet</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {notices.map((n) => {
                    const cfg = priorityConfig[n.priority] || priorityConfig.normal
                    return (
                      <div key={n.id} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                        <span className={`mt-0.5 flex-shrink-0 inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold ${cfg.color}`}>
                          <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 break-words">{n.title}</p>
                          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 break-words">
                            {n.course ? n.course.title : 'General'} · {formatDate(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Quick Actions + Motivational */}
          <div className="space-y-4 sm:space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1">⚡ Quick Actions</h2>
              <p className="text-xs text-gray-400 mb-4 sm:mb-5">Jump to any section</p>
              <div className="space-y-2 sm:space-y-2.5">
                {quickActions.map((a) => (
                  <Link key={a.href} href={a.href} className={`group flex items-center gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-xl border border-gray-100 transition-all ${a.color}`}>
                    <span className="text-xl sm:text-2xl flex-shrink-0">{a.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-bold text-gray-800 group-hover:inherit transition-colors">{a.label}</p>
                      <p className="text-[10px] sm:text-xs text-gray-400">{a.desc}</p>
                    </div>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 group-hover:text-current ml-auto flex-shrink-0 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* Motivational / Tips Card */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)' }}>
              <div className="p-5 sm:p-6">
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🎯</div>
                <h3 className="text-white font-bold text-base sm:text-lg">Stay Consistent!</h3>
                <p className="text-blue-200 text-xs sm:text-sm mt-1 sm:mt-2 leading-relaxed">
                  Consistent effort beats talent. Study a little every day and you will achieve great results.
                </p>
                <div className="mt-4 sm:mt-5 flex items-center gap-2 sm:gap-3">
                  <Link href="/courses" className="flex-1 text-center py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors">
                    Explore Courses
                  </Link>
                  <Link href="/dashboard/profile" className="flex-1 text-center py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors">
                    My Profile
                  </Link>
                </div>
              </div>

              {/* Progress Tip */}
              <div className="border-t border-white/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 text-sm sm:text-lg flex-shrink-0">✓</div>
                <p className="text-blue-200 text-[10px] sm:text-xs leading-relaxed">
                  <span className="text-white font-semibold">Tip:</span> Check notices regularly — your admin may post important updates!
                </p>
              </div>
            </div>

            {/* Time Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 text-center">
              <p className="text-3xl sm:text-4xl font-black text-gray-900 tabular-nums">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 font-medium">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
