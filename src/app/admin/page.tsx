'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'

interface AdminStats {
  totalUsers: number
  totalCourses: number
  totalEnrollments: number
  approvedEnrollments: number
  pendingEnrollments: number
  rejectedEnrollments: number
}

interface SessionUser {
  id: string
  name?: string | null
  email?: string
  role?: string
  image?: string | null
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await authClient.getSession()
        if (!data) { router.push('/login'); return }
        if ((data.user as { role?: string } | undefined)?.role !== 'ADMIN') {
          router.push('/dashboard'); return
        }
        setSession(data)
        setUser(data.user as SessionUser)

        const res = await fetch('/api/admin/stats')
        const d = await res.json()
        if (d.success) setStats(d.stats)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [router])

  const initials = (user?.name || 'A').split(' ').filter(Boolean).slice(0, 2).map((p: string) => p[0]?.toUpperCase()).join('')

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full border-4 border-indigo-600/20 border-t-indigo-600 animate-spin" />
            <p className="text-gray-500 font-medium">Loading admin dashboard…</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-indigo-600',
      href: '/admin/users',
      change: '+12%',
      changeUp: true,
    },
    {
      label: 'Total Courses',
      value: stats?.totalCourses ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      gradient: 'from-violet-500 to-purple-600',
      href: '/admin/courses',
      change: 'Active',
      changeUp: true,
    },
    {
      label: 'Active Enrollments',
      value: stats?.approvedEnrollments ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-teal-600',
      href: '/admin/enrollments',
      change: 'Approved',
      changeUp: true,
    },
    {
      label: 'Pending Requests',
      value: stats?.pendingEnrollments ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-amber-500 to-orange-500',
      href: '/admin/enrollments',
      change: 'Awaiting',
      changeUp: false,
    },
  ]

  const quickActions = [
    {
      href: '/admin/users',
      icon: '👥',
      label: 'Manage Users',
      desc: 'View, block/unblock or remove students',
      color: 'hover:border-blue-300 hover:bg-blue-50 group-hover:text-blue-600',
      badge: null,
    },
    {
      href: '/admin/courses',
      icon: '📚',
      label: 'Manage Courses',
      desc: 'Create, edit and publish courses',
      color: 'hover:border-violet-300 hover:bg-violet-50 group-hover:text-violet-600',
      badge: null,
    },
    {
      href: '/admin/enrollments',
      icon: '✅',
      label: 'Enrollments',
      desc: 'Approve, reject and track requests',
      color: 'hover:border-emerald-300 hover:bg-emerald-50 group-hover:text-emerald-600',
      badge: stats?.pendingEnrollments ?? 0,
    },
    {
      href: '/admin/notices',
      icon: '📢',
      label: 'Notices',
      desc: 'Create and manage announcements',
      color: 'hover:border-amber-300 hover:bg-amber-50 group-hover:text-amber-600',
      badge: null,
    },
    {
      href: '/admin/courses-manage',
      icon: '🎬',
      label: 'Course Videos',
      desc: 'Upload and manage course videos',
      color: 'hover:border-rose-300 hover:bg-rose-50 group-hover:text-rose-600',
      badge: null,
    },
    {
      href: '/dashboard/profile',
      icon: '👤',
      label: 'Admin Profile',
      desc: 'Manage your account and settings',
      color: 'hover:border-indigo-300 hover:bg-indigo-50 group-hover:text-indigo-600',
      badge: null,
    },
  ]

  const enrollmentBreakdown = [
    { label: 'Approved', value: stats?.approvedEnrollments ?? 0, color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Pending', value: stats?.pendingEnrollments ?? 0, color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Rejected', value: stats?.rejectedEnrollments ?? 0, color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
  ]

  const total = (stats?.totalEnrollments ?? 0) || 1

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* ── Hero Banner ── */}
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #4f46e5 100%)' }}
        >
          {/* Decorative blobs */}
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute top-10 right-48 w-36 h-36 rounded-full bg-indigo-500/10" />

          <div className="relative px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <Link href="/dashboard/profile">
                <div className="w-16 h-16 rounded-2xl border-2 border-white/40 bg-white/20 flex items-center justify-center font-black text-xl text-white shadow-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer flex-shrink-0">
                  {user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
              </Link>

              <div>
                <p className="text-indigo-300 text-sm font-medium tracking-wide flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-semibold">👑 ADMIN</span>
                  {getGreeting()} · {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {user?.name || 'Admin'}
                </h1>
                <p className="mt-1 text-indigo-200 text-sm">
                  Manage your coaching center from one powerful workspace 🚀
                </p>
              </div>
            </div>

            {/* Right side — quick CTA */}
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                href="/admin/enrollments"
                className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-5 py-2.5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Review Requests
                {(stats?.pendingEnrollments ?? 0) > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {stats?.pendingEnrollments}
                  </span>
                )}
              </Link>
              <Link
                href="/admin/courses"
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-5 py-2.5 rounded-2xl transition-all text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Course
              </Link>
            </div>
          </div>

          {/* Bottom live time strip */}
          <div className="relative border-t border-white/10 px-8 py-3 flex items-center justify-between">
            <p className="text-indigo-300 text-xs">
              🕐 {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · Admin Control Center
            </p>
            <p className="text-indigo-300 text-xs hidden sm:block">
              Total Students: <span className="text-white font-bold">{stats?.totalUsers ?? 0}</span> &nbsp;·&nbsp;
              Courses: <span className="text-white font-bold">{stats?.totalCourses ?? 0}</span>
            </p>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all p-6 flex items-center gap-5"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform flex-shrink-0`}>
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 font-medium mt-0.5">{s.label}</p>
              </div>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 ml-auto transition-colors flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* ── Pending Alert ── */}
        {stats && stats.pendingEnrollments > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">⏳</div>
              <div>
                <h3 className="font-bold text-amber-900">
                  {stats.pendingEnrollments} Enrollment Request{stats.pendingEnrollments !== 1 ? 's' : ''} Pending
                </h3>
                <p className="text-sm text-amber-700 mt-0.5">
                  Students are waiting for your approval. Review and take action now.
                </p>
              </div>
            </div>
            <Link
              href="/admin/enrollments"
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-md"
            >
              Review Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {/* ── Main Grid ── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* LEFT */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-900">⚡ Quick Actions</h2>
                <p className="text-xs text-gray-400 mt-0.5">Jump to any management section</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickActions.map((a) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    className={`group flex items-center gap-4 p-4 rounded-xl border border-gray-100 transition-all ${a.color}`}
                  >
                    <span className="text-2xl flex-shrink-0">{a.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        {a.label}
                        {typeof a.badge === 'number' && a.badge > 0 && (
                          <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                            {a.badge}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-current ml-auto flex-shrink-0 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* Enrollment Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">📊 Enrollment Overview</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Total: {stats?.totalEnrollments ?? 0} requests</p>
                </div>
                <Link href="/admin/enrollments" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  Manage
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>

              {/* Bar chart visual */}
              <div className="flex items-end gap-3 h-24 mb-5">
                {enrollmentBreakdown.map((item) => {
                  const pct = Math.round((item.value / total) * 100)
                  return (
                    <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-gray-700">{item.value}</span>
                      <div className="w-full rounded-t-lg transition-all" style={{ height: `${Math.max(pct, 4)}%`, minHeight: 8 }}>
                        <div className={`w-full h-full rounded-t-lg ${item.color}`} />
                      </div>
                      <span className="text-xs text-gray-500">{item.label}</span>
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="space-y-2.5">
                {enrollmentBreakdown.map((item) => {
                  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color} flex-shrink-0`} />
                      <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${item.color} transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-700 w-8 text-right">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            {/* Platform Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">🏫 Platform Summary</h2>
              <div className="divide-y divide-gray-100">
                {[
                  { label: 'Total Students', value: stats?.totalUsers ?? 0, icon: '👥', color: 'text-blue-600' },
                  { label: 'Published Courses', value: stats?.totalCourses ?? 0, icon: '📚', color: 'text-violet-600' },
                  { label: 'Total Enrollments', value: stats?.totalEnrollments ?? 0, icon: '📋', color: 'text-indigo-600' },
                  { label: 'Active Students', value: stats?.approvedEnrollments ?? 0, icon: '✅', color: 'text-emerald-600' },
                  { label: 'Pending Reviews', value: stats?.pendingEnrollments ?? 0, icon: '⏳', color: 'text-amber-600' },
                ].map((row) => (
                  <div key={row.label} className="py-3 flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <span>{row.icon}</span>
                      {row.label}
                    </span>
                    <span className={`text-sm font-bold ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Tips */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}
            >
              <div className="p-6">
                <div className="text-4xl mb-3">🛡️</div>
                <h3 className="text-white font-bold text-lg">Admin Pro Tips</h3>
                <ul className="mt-3 space-y-2.5">
                  {[
                    'Review pending enrollments regularly',
                    'Post notices to keep students informed',
                    'Add videos to maximize course value',
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-indigo-200 text-sm">
                      <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex gap-3">
                  <Link
                    href="/admin/enrollments"
                    className="flex-1 text-center py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    Enrollments
                  </Link>
                  <Link
                    href="/admin/notices"
                    className="flex-1 text-center py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    Post Notice
                  </Link>
                </div>
              </div>

              <div className="border-t border-white/10 px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400 text-lg flex-shrink-0">⚡</div>
                <p className="text-indigo-300 text-xs leading-relaxed">
                  <span className="text-white font-semibold">Note:</span> Only approved students can access course content and videos.
                </p>
              </div>
            </div>

            {/* Live Clock */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-4xl font-black text-gray-900 tabular-nums">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-sm text-gray-400 mt-1 font-medium">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}