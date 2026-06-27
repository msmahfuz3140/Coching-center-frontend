'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import toast from 'react-hot-toast'

interface Notice {
  id: string
  title: string
  content: string
  priority: string
  createdAt: string
  author: { id: string; name: string | null }
  course: { id: string; title: string; slug: string } | null
}

type FilterType = 'all' | 'general' | string

const priorityConfig: Record<string, { badge: string; border: string; dot: string; icon: string; label: string }> = {
  low:    { badge: 'bg-gray-100 text-gray-600 border border-gray-200',      border: 'border-l-gray-300',   dot: 'bg-gray-400',   icon: '💬', label: 'Low' },
  normal: { badge: 'bg-blue-50 text-blue-700 border border-blue-200',       border: 'border-l-blue-500',   dot: 'bg-blue-500',   icon: '📢', label: 'Normal' },
  high:   { badge: 'bg-orange-50 text-orange-700 border border-orange-200', border: 'border-l-orange-500', dot: 'bg-orange-500', icon: '⚠️', label: 'High' },
  urgent: { badge: 'bg-red-50 text-red-700 border border-red-200',          border: 'border-l-red-500',    dot: 'bg-red-500',    icon: '🚨', label: 'Urgent' },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function StudentNoticesPage() {
  const [notices, setNotices]     = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter]       = useState<FilterType>('all')
  const [search, setSearch]       = useState('')
  const [expanded, setExpanded]   = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      try {
        const { data } = await authClient.getSession()
        if (!data) { router.push('/login'); return }

        const res = await fetch('/api/notices')
        const d = await res.json()
        if (d.success) setNotices(d.notices)
        else toast.error(d.error || 'Failed to load notices')
      } catch (e) {
        console.error(e)
        toast.error('Failed to load notices')
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [router])

  const uniqueCourses = Array.from(
    new Map(notices.filter(n => n.course).map(n => [n.course!.id, n.course!])).values()
  )

  const filtered = notices
    .filter(n => {
      if (filter === 'general') return !n.course
      if (filter !== 'all') return n.course?.id === filter
      return true
    })
    .filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))

  const urgentCount = notices.filter(n => n.priority === 'urgent').length
  const highCount   = notices.filter(n => n.priority === 'high').length

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin" />
            <p className="text-gray-500 font-medium">Loading notices…</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%)' }}>
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 left-10 w-48 h-48 rounded-full bg-white/5" />
          <div className="relative px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-purple-200 text-xs font-semibold uppercase tracking-widest mb-1">Announcements</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Notice Board</h1>
              <p className="text-purple-100 text-sm mt-1">Stay updated with all important announcements</p>
            </div>
            <div className="flex items-center gap-3">
              {urgentCount > 0 && (
                <div className="bg-red-500/20 border border-red-400/30 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
                  <p className="text-red-200 text-xs font-semibold">🚨 Urgent</p>
                  <p className="text-white text-2xl font-extrabold">{urgentCount}</p>
                </div>
              )}
              <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
                <p className="text-purple-200 text-xs font-semibold">Total</p>
                <p className="text-white text-2xl font-extrabold">{notices.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        {(urgentCount > 0 || highCount > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'All Notices', value: notices.length, color: 'from-blue-500 to-indigo-600', icon: '📢' },
              { label: 'Urgent',      value: urgentCount,    color: 'from-red-500 to-rose-600',    icon: '🚨' },
              { label: 'High',        value: highCount,      color: 'from-orange-500 to-amber-500', icon: '⚠️' },
              { label: 'General',     value: notices.filter(n => !n.course).length, color: 'from-purple-500 to-indigo-600', icon: '📌' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-lg shadow-md flex-shrink-0`}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Filters + Search ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex flex-col gap-4">
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All', count: notices.length },
                { id: 'general', label: 'General', count: notices.filter(n => !n.course).length },
                ...uniqueCourses.map(c => ({ id: c.id, label: c.title, count: notices.filter(n => n.course?.id === c.id).length })),
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    filter === tab.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    filter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search notices by title or content…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* ── Notices List ── */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5">📭</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Notices Found</h3>
            <p className="text-gray-500 text-sm">{search ? `No results for "${search}"` : 'No announcements available at this time.'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(notice => {
              const cfg = priorityConfig[notice.priority] || priorityConfig.normal
              const isExpanded = expanded === notice.id
              return (
                <div
                  key={notice.id}
                  className={`bg-white rounded-2xl border border-gray-100 shadow-sm border-l-4 ${cfg.border} hover:shadow-md transition-all duration-200`}
                >
                  <div className="p-5 sm:p-6">
                    {/* Top meta row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      {notice.course ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                          📘 {notice.course.title}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600">
                          📌 General
                        </span>
                      )}
                      <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {timeAgo(notice.createdAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 leading-snug">{notice.title}</h3>

                    {/* Content (truncated / expanded) */}
                    <p className={`text-sm text-gray-600 leading-relaxed whitespace-pre-wrap ${isExpanded ? '' : 'line-clamp-3'}`}>
                      {notice.content}
                    </p>

                    {notice.content.length > 200 && (
                      <button
                        onClick={() => setExpanded(isExpanded ? null : notice.id)}
                        className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        {isExpanded ? '↑ Show less' : '↓ Read more'}
                      </button>
                    )}

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Posted by <span className="font-semibold text-gray-600 ml-0.5">{notice.author.name || 'Admin'}</span>
                        <span className="mx-1">·</span>
                        {formatDate(notice.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}