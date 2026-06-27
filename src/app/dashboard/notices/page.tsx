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

export default function StudentNoticesPage() {
  const [session, setSession] = useState<any>(null)
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const router = useRouter()

  useEffect(() => {
    async function init() {
      try {
        const { data } = await authClient.getSession()
        if (!data) { router.push('/login'); return }
        setSession(data)
        await loadNotices()
      } catch (e) { console.error(e) } finally { setIsLoading(false) }
    }
    init()
  }, [])

  const loadNotices = async () => {
    try {
      const res = await fetch('/api/notices')
      const d = await res.json()
      if (d.success) setNotices(d.notices)
      else throw new Error(d.error)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load notices')
    }
  }

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700',
    normal: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  }

  const filteredNotices = filter === 'all'
    ? notices
    : notices.filter(n => n.course?.id === filter || (filter === 'general' && !n.course))

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notices</h1>
          <p className="text-gray-600 mt-1">Stay updated with announcements and course notices</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Notices
            </button>
            <button
              onClick={() => setFilter('general')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'general' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              General
            </button>
            {/* Unique courses that have notices */}
            {Array.from(new Map(notices.filter(n => n.course).map(n => [n.course!.id, n.course!])).values()).map(course => (
              <button
                key={course.id}
                onClick={() => setFilter(course.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === course.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {course.title}
              </button>
            ))}
          </div>
        </div>

        {/* Notices List */}
        {filteredNotices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notices</h3>
            <p className="text-gray-500">No announcements available at this time</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotices.map(notice => (
              <div key={notice.id} className={`bg-white rounded-xl border-l-4 shadow-lg border-gray-100 p-6 hover:shadow-xl transition ${
                notice.priority === 'urgent' ? 'border-l-red-500' :
                notice.priority === 'high' ? 'border-l-orange-500' :
                notice.priority === 'normal' ? 'border-l-blue-500' : 'border-l-gray-400'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${priorityColors[notice.priority] || 'bg-gray-100 text-gray-700'}`}>
                        {notice.priority.toUpperCase()}
                      </span>
                      {notice.course && (
                        <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {notice.course.title}
                        </span>
                      )}
                      {!notice.course && (
                        <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                          General
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(notice.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{notice.title}</h3>
                    <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{notice.content}</p>
                    <p className="text-xs text-gray-400 mt-3">Posted by {notice.author.name || 'Admin'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}