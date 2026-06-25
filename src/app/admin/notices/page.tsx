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
  author: { id: string; name: string | null; email: string }
  course: { id: string; title: string; slug: string } | null
}

export default function AdminNoticesPage() {
  const [session, setSession] = useState<any>(null)
  const [notices, setNotices] = useState<Notice[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Notice | null>(null)
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal', courseId: '' })
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      try {
        const { data } = await authClient.getSession()
        if (!data) { router.push('/login'); return }
        if ((data.user as any)?.role !== 'ADMIN') { router.push('/dashboard'); return }
        setSession(data)
        await Promise.all([loadNotices(), loadCourses()])
      } catch (e) { console.error(e) } finally { setIsLoading(false) }
    }
    init()
  }, [])

  const loadNotices = async () => {
    try {
      const res = await fetch('/api/admin/notices')
      const d = await res.json()
      if (d.success) setNotices(d.notices)
    } catch { toast.error('Failed to load notices') }
  }

  const loadCourses = async () => {
    try {
      const res = await fetch('/api/admin/courses')
      if (res.ok) setCourses(await res.json())
    } catch {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const body: any = { ...form }
      if (!body.courseId) body.courseId = null
      if (editing) body.id = editing.id

      const res = await fetch('/api/admin/notices', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await res.json()
      if (d.success) {
        toast.success(editing ? 'Notice updated!' : 'Notice created!')
        resetForm()
        await loadNotices()
      } else throw new Error(d.error)
    } catch (err: any) { toast.error(err.message) } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notice?')) return
    try {
      const res = await fetch(`/api/admin/notices?id=${id}`, { method: 'DELETE' })
      const d = await res.json()
      if (d.success) { toast.success('Deleted'); await loadNotices() }
      else throw new Error(d.error)
    } catch (err: any) { toast.error(err.message) }
  }

  const resetForm = () => {
    setForm({ title: '', content: '', priority: 'normal', courseId: '' })
    setEditing(null)
    setShowForm(false)
  }

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700',
    normal: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notices</h1>
            <p className="text-gray-500 mt-1">Create and manage course announcements</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-lg">
            <svg className="w-5 h-5 mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {showForm ? 'Cancel' : 'New Notice'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editing ? 'Edit Notice' : 'Create Notice'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Exam schedule update" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea rows={4} required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Notice details..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="low">Low</option><option value="normal">Normal</option>
                    <option value="high">High</option><option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course (optional)</label>
                  <select value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">All Courses</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:bg-gray-400 transition shadow-lg">
                  {saving ? 'Saving...' : editing ? 'Update Notice' : 'Create Notice'}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {notices.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notices Yet</h3>
            <p className="text-gray-500">Create announcements for students</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map(notice => (
              <div key={notice.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[notice.priority] || 'bg-gray-100'}`}>
                        {notice.priority}
                      </span>
                      {notice.course && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {notice.course.title}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{new Date(notice.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{notice.title}</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{notice.content}</p>
                    <p className="text-xs text-gray-400 mt-2">By {notice.author.name || notice.author.email}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => {
                      setEditing(notice)
                      setForm({ title: notice.title, content: notice.content, priority: notice.priority, courseId: notice.course?.id || '' })
                      setShowForm(true)
                    }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(notice.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
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