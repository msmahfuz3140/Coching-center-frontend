'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'

interface EnrollmentWithCourse {
  id: string
  enrolledAt: string
  completedAt: string | null
  progress: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestMessage: string | null
  responseMessage: string | null
  reviewedAt: string | null
  course: {
    id: string
    title: string
    slug: string
    description?: string
    category: string
    thumbnail?: string | null
    instructor?: { id: string; name: string | null; email: string }
    _count?: { enrollments: number; videos: number }
    videos?: unknown[]
    syllabus?: unknown[]
  }
}

type FilterTab = 'all' | 'APPROVED' | 'PENDING' | 'REJECTED'

const categoryLabels: Record<string, string> = {
  DIPLOMA:                'Diploma',
  DUET_TECH:              'DUET Tech',
  DUET_NON_TECH:          'DUET Non-Tech',
  SSC_9_10:               'SSC 9-10',
  POLYTECHNIC_ADMISSION:  'Polytechnic',
  REFERRED_BATCH:         'Referred',
}

const categoryGradients: Record<string, string> = {
  DIPLOMA:                'from-blue-500 to-indigo-600',
  DUET_TECH:              'from-purple-500 to-pink-600',
  DUET_NON_TECH:          'from-rose-500 to-red-600',
  SSC_9_10:               'from-emerald-500 to-teal-600',
  POLYTECHNIC_ADMISSION:  'from-amber-500 to-orange-600',
  REFERRED_BATCH:         'from-cyan-500 to-blue-600',
}

const statusConfig = {
  APPROVED: {
    label: 'Active',
    badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
  },
  PENDING: {
    label: 'Pending',
    badge: 'bg-amber-100 text-amber-700 border border-amber-200',
    dot: 'bg-amber-400',
  },
  REJECTED: {
    label: 'Rejected',
    badge: 'bg-red-100 text-red-700 border border-red-200',
    dot: 'bg-red-500',
  },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MyCoursesPage() {
  const [session, setSession]           = useState<{ user: { role?: string } } | null>(null)
  const [isLoading, setIsLoading]       = useState(true)
  const [enrollments, setEnrollments]   = useState<EnrollmentWithCourse[]>([])
  const [activeTab, setActiveTab]       = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery]   = useState('')
  const router = useRouter()

  useEffect(() => {
    async function init() {
      try {
        const { data } = await authClient.getSession()
        if (!data) { router.push('/login'); return }
        setSession(data as typeof session)

        const res = await fetch('/api/enrollments')
        if (res.ok) {
          const json = await res.json()
          setEnrollments(Array.isArray(json) ? json : [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [router])

  const approved = enrollments.filter(e => e.status === 'APPROVED')
  const pending  = enrollments.filter(e => e.status === 'PENDING')
  const rejected = enrollments.filter(e => e.status === 'REJECTED')

  const filtered = enrollments
    .filter(e => activeTab === 'all' || e.status === activeTab)
    .filter(e => e.course.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: 'all',      label: 'All',      count: enrollments.length },
    { id: 'APPROVED', label: 'Active',   count: approved.length },
    { id: 'PENDING',  label: 'Pending',  count: pending.length },
    { id: 'REJECTED', label: 'Rejected', count: rejected.length },
  ]

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin" />
            <p className="text-gray-500 font-medium">Loading your courses…</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #7c3aed 100%)' }}>
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 left-10 w-48 h-48 rounded-full bg-white/5" />
          <div className="relative px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Student Portal</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Courses</h1>
              <p className="text-blue-100 text-sm mt-1">Track your learning journey and course progress</p>
            </div>
            <Link
              href="/courses"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-2.5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Browse Courses
            </Link>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Enrolled', value: enrollments.length, gradient: 'from-blue-500 to-indigo-600', icon: '📚' },
            { label: 'Active',         value: approved.length,    gradient: 'from-emerald-500 to-teal-600', icon: '✅' },
            { label: 'Pending',        value: pending.length,     gradient: 'from-amber-500 to-orange-500', icon: '⏳' },
            { label: 'Rejected',       value: rejected.length,    gradient: 'from-red-500 to-rose-600',    icon: '❌' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-xl shadow-md flex-shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Tab Filter */}
            <div className="flex flex-wrap gap-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search courses…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* ── Course Cards ── */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5">📭</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'No courses found' : activeTab === 'all' ? 'No Courses Yet' : `No ${statusConfig[activeTab as Exclude<FilterTab,'all'>]?.label} Courses`}
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              {searchQuery
                ? `No courses match "${searchQuery}". Try a different keyword.`
                : 'Browse our courses and request enrollment to start your learning journey.'}
            </p>
            {!searchQuery && (
              <Link href="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
                Browse Courses →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(enrollment => {
              const sc = statusConfig[enrollment.status]
              const grad = categoryGradients[enrollment.course.category] || 'from-blue-500 to-indigo-600'
              const catLabel = categoryLabels[enrollment.course.category] || enrollment.course.category

              return (
                <div
                  key={enrollment.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                >
                  {/* Card thumbnail */}
                  <div className={`relative h-44 bg-gradient-to-br ${grad} flex flex-col items-center justify-center overflow-hidden`}>
                    {/* Decorative circles */}
                    <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
                    <div className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full bg-white/10" />

                    {enrollment.course.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={enrollment.course.thumbnail}
                        alt={enrollment.course.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                      />
                    ) : (
                      <div className="relative text-6xl opacity-40 group-hover:opacity-60 transition-opacity">📘</div>
                    )}

                    {/* Category pill */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-white/30">
                        {catLabel}
                      </span>
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${sc.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 group-hover:text-blue-700 transition-colors line-clamp-2">
                      {enrollment.course.title}
                    </h3>

                    {enrollment.course.instructor && (
                      <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {enrollment.course.instructor.name || enrollment.course.instructor.email}
                      </p>
                    )}

                    {enrollment.course.description && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                        {enrollment.course.description}
                      </p>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(enrollment.enrolledAt)}
                      </span>
                      {enrollment.course._count && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          {enrollment.course._count.videos} videos
                        </span>
                      )}
                    </div>

                    {/* Progress (APPROVED only) */}
                    {enrollment.status === 'APPROVED' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-gray-600">Progress</span>
                          <span className="text-xs font-bold text-blue-600">{Math.round(enrollment.progress)}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-500`}
                            style={{ width: `${enrollment.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Pending response message */}
                    {enrollment.status === 'REJECTED' && enrollment.responseMessage && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-xs text-red-500 font-semibold mb-0.5">Admin Response:</p>
                        <p className="text-xs text-red-700">{enrollment.responseMessage}</p>
                      </div>
                    )}

                    {enrollment.status === 'PENDING' && (
                      <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2">
                        <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-amber-700 font-medium">Awaiting admin approval</p>
                      </div>
                    )}

                    {/* CTA Button */}
                    <div className="mt-auto">
                      {enrollment.status === 'APPROVED' && (
                        <Link
                          href={`/courses/${enrollment.course.slug}`}
                          className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r ${grad} text-white hover:opacity-90 hover:shadow-lg transition-all`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Continue Learning
                        </Link>
                      )}
                      {enrollment.status === 'PENDING' && (
                        <Link
                          href={`/courses/${enrollment.course.slug}`}
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold border-2 border-amber-300 text-amber-700 hover:bg-amber-50 transition-all"
                        >
                          View Course Details
                        </Link>
                      )}
                      {enrollment.status === 'REJECTED' && (
                        <Link
                          href={`/courses/${enrollment.course.slug}`}
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all"
                        >
                          Request Again →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Admin Extra Actions ── */}
        {session?.user?.role === 'ADMIN' && (
          <div className="rounded-2xl p-6 border border-blue-200 bg-blue-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-blue-900">👑 Admin Actions</h3>
              <p className="text-sm text-blue-700 mt-0.5">Manage all courses and enrollments</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/courses" className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Create Course
              </Link>
              <Link href="/admin/enrollments" className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-blue-300 text-blue-700 text-sm font-bold rounded-xl hover:bg-blue-50 transition-colors">
                Manage Enrollments
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}