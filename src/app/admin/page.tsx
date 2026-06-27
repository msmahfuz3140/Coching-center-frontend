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

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const router = useRouter()

  const loadSession = async () => {
    try {
      const { data } = await authClient.getSession()
      if (!data) {
        router.push('/login')
        return
      }
      if ((data.user as { role?: string } | undefined)?.role !== 'ADMIN') {
        router.push('/dashboard')
        return
      }
      setSession(data)
    } catch (error) {
      console.error(error)
    }
  }

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const d = await res.json()
      if (d.success) {
        setStats(d.stats)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  useEffect(() => {
    const init = async () => {
      await loadSession()
      await loadStats()
      setIsLoading(false)
    }
    init()
  }, [])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'Total Courses', value: stats?.totalCourses ?? 0, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { label: 'Active Enrollments', value: stats?.approvedEnrollments ?? 0, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Pending Requests', value: stats?.pendingEnrollments ?? 0, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ]

  const quickActions = [
    { href: '/admin/users', label: 'Manage Users', desc: 'View, block/unblock or remove users' },
    { href: '/admin/courses', label: 'Manage Courses', desc: 'Create and manage courses' },
    { href: '/admin/enrollments', label: 'Enrollments', desc: 'Approve, reject, and track enrollments' },
    { href: '/admin/notices', label: 'Notices', desc: 'Create and manage announcements' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-8 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-200">Admin Control Center</p>
          <h1 className="mt-3 text-3xl font-bold">Welcome, {session?.user?.name || 'Admin'}</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">
            Manage students, courses, enrollments, and notices from one professional workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl hover:border-blue-200 transition-all group">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{action.label}</h3>
              <p className="text-sm text-gray-600 mt-1">{action.desc}</p>
            </Link>
          ))}
        </div>

        {/* Pending Enrollments Alert */}
        {stats && stats.pendingEnrollments > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-amber-900">Pending Enrollment Requests</h3>
                <p className="text-sm text-amber-700 mt-1">
                  There {stats.pendingEnrollments === 1 ? 'is' : 'are'} {stats.pendingEnrollments} enrollment request{stats.pendingEnrollments === 1 ? '' : 's'} awaiting your review.
                </p>
              </div>
              <Link href="/admin/enrollments" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-medium">
                Review Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}