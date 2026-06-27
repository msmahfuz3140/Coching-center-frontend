'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'

interface Enrollment {
  id: string
  status: string
  progress: number
  enrolledAt: string
  course: {
    id: string
    title: string
    slug: string
    category: string
    syllabus: {
      id: string
      title: string
      orderIndex: number
      topics: {
        id: string
        title: string
        duration?: string | null
        orderIndex: number
      }[]
    }[]
    _count?: { videos: number; enrollments: number }
  }
}

const categoryGradients: Record<string, string> = {
  DIPLOMA:               'from-blue-500 to-indigo-600',
  DUET_TECH:             'from-purple-500 to-pink-600',
  DUET_NON_TECH:         'from-rose-500 to-red-600',
  SSC_9_10:              'from-emerald-500 to-teal-600',
  POLYTECHNIC_ADMISSION: 'from-amber-500 to-orange-600',
  REFERRED_BATCH:        'from-cyan-500 to-blue-600',
}

const categoryLabels: Record<string, string> = {
  DIPLOMA:               'Diploma',
  DUET_TECH:             'DUET Tech',
  DUET_NON_TECH:         'DUET Non-Tech',
  SSC_9_10:              'SSC 9-10',
  POLYTECHNIC_ADMISSION: 'Polytechnic',
  REFERRED_BATCH:        'Referred',
}

export default function AssignmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [isLoading, setIsLoading]     = useState(true)
  const [activeTab, setActiveTab]     = useState<string>('overview')
  const router = useRouter()

  useEffect(() => {
    async function init() {
      try {
        const { data } = await authClient.getSession()
        if (!data) { router.push('/login'); return }

        const res = await fetch('/api/enrollments')
        if (res.ok) {
          const json = await res.json()
          const approved = (Array.isArray(json) ? json : []).filter((e: Enrollment) => e.status === 'APPROVED')
          setEnrollments(approved)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [router])

  // Count total topics across all syllabuses
  const totalTopics = enrollments.reduce((acc, e) =>
    acc + (e.course.syllabus?.reduce((s, syl) => s + (syl.topics?.length || 0), 0) || 0), 0
  )

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full border-4 border-purple-600/20 border-t-purple-600 animate-spin" />
            <p className="text-gray-500 font-medium">Loading assignments…</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #7c3aed 100%)' }}>
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 left-10 w-48 h-48 rounded-full bg-white/5" />
          <div className="relative px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-purple-300 text-xs font-semibold uppercase tracking-widest mb-1">Learning Tasks</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Assignments & Syllabus</h1>
              <p className="text-blue-100 text-sm mt-1">Track your course topics and learning progress</p>
            </div>
            <Link
              href="/courses"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-2.5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
            >
              Browse Courses
            </Link>
          </div>
        </div>

        {/* ── Feature Notice ── */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 text-lg flex-shrink-0 mt-0.5">🚧</div>
          <div>
            <p className="text-sm font-bold text-amber-900">Assignments Feature Coming Soon</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Full assignment submission & grading is under development. Below you can view your course syllabuses and topics to track learning progress.
            </p>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Active Courses',  value: enrollments.length, gradient: 'from-blue-500 to-indigo-600',   icon: '📘' },
            { label: 'Total Topics',    value: totalTopics,         gradient: 'from-purple-500 to-pink-600',   icon: '📝' },
            { label: 'In Progress',     value: enrollments.filter(e => (e.progress || 0) > 0 && (e.progress || 0) < 100).length, gradient: 'from-emerald-500 to-teal-600', icon: '⚡' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
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

        {/* ── No Courses State ── */}
        {enrollments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5">📭</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Courses</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              Enroll in a course to see your syllabus topics and track your assignments here.
            </p>
            <Link href="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
              Browse Courses →
            </Link>
          </div>
        ) : (
          <>
            {/* ── Course Tab Selector ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Select Course</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  📊 Overview
                </button>
                {enrollments.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setActiveTab(e.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all truncate max-w-[200px] ${
                      activeTab === e.id ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {e.course.title}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Overview Tab ── */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {enrollments.map(e => {
                  const grad = categoryGradients[e.course.category] || 'from-blue-500 to-indigo-600'
                  const topicCount = e.course.syllabus?.reduce((s, syl) => s + (syl.topics?.length || 0), 0) || 0
                  return (
                    <button
                      key={e.id}
                      onClick={() => setActiveTab(e.id)}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-xl shadow-md`}>
                          📘
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">{e.course.title}</p>
                          <p className="text-xs text-gray-400">{categoryLabels[e.course.category] || e.course.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 font-medium">Progress</span>
                        <span className="text-xs font-bold text-blue-600">{Math.round(e.progress || 0)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                        <div className={`h-full rounded-full bg-gradient-to-r ${grad}`} style={{ width: `${e.progress || 0}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{e.course.syllabus?.length || 0} chapters · {topicCount} topics</span>
                        <span className="text-blue-600 font-semibold group-hover:underline">View Syllabus →</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* ── Single Course Syllabus Tab ── */}
            {enrollments.map(e => activeTab === e.id && (
              <div key={e.id} className="space-y-4">
                {/* Course header */}
                <div className={`rounded-2xl p-5 text-white bg-gradient-to-r ${categoryGradients[e.course.category] || 'from-blue-500 to-indigo-600'}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">{categoryLabels[e.course.category]}</p>
                      <h2 className="text-xl font-extrabold mt-0.5">{e.course.title}</h2>
                    </div>
                    <Link href={`/courses/${e.course.slug}`} className="flex-shrink-0 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all">
                      Go to Course →
                    </Link>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/80">Overall Progress</span>
                      <span className="font-bold">{Math.round(e.progress || 0)}%</span>
                    </div>
                    <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: `${e.progress || 0}%` }} />
                    </div>
                  </div>
                </div>

                {/* Syllabus chapters */}
                {!e.course.syllabus || e.course.syllabus.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="text-5xl mb-4">📭</div>
                    <p className="text-gray-700 font-semibold">No syllabus available yet</p>
                    <p className="text-gray-400 text-sm mt-1">The instructor hasn't added syllabus content yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...e.course.syllabus].sort((a, b) => a.orderIndex - b.orderIndex).map((chapter, ci) => (
                      <div key={chapter.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Chapter header */}
                        <div className="bg-gray-50 border-b border-gray-100 px-5 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                            {ci + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm">{chapter.title}</h3>
                            <p className="text-xs text-gray-400">{chapter.topics?.length || 0} topics</p>
                          </div>
                        </div>

                        {/* Topics */}
                        {chapter.topics && chapter.topics.length > 0 ? (
                          <div className="divide-y divide-gray-50">
                            {[...chapter.topics].sort((a, b) => a.orderIndex - b.orderIndex).map((topic, ti) => (
                              <div key={topic.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                                <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-blue-400 flex items-center justify-center text-xs text-gray-400 font-bold flex-shrink-0 transition-colors">
                                  {ti + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-800 font-medium group-hover:text-blue-700 transition-colors">{topic.title}</p>
                                </div>
                                {topic.duration && (
                                  <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {topic.duration}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-5 py-4 text-center">
                            <p className="text-xs text-gray-400">No topics in this chapter yet</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}