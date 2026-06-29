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

const PRIORITY_META: Record<string, { label: string; color: string; dot: string; border: string; emoji: string }> = {
  low:    { label: 'Low',    color: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400',    border: 'border-l-gray-300',   emoji: '📌' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500',    border: 'border-l-blue-400',   emoji: '📢' },
  high:   { label: 'High',   color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500',  border: 'border-l-orange-400', emoji: '🔔' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700',       dot: 'bg-red-500',     border: 'border-l-red-500',    emoji: '🚨' },
}

const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'
const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5'
const EMPTY_FORM = { title: '', content: '', priority: 'normal', courseId: '' }

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Notice | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [filterPriority, setFilterPriority] = useState('')
  const router = useRouter()

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    async function init() {
      try {
        const { data } = await authClient.getSession()
        if (!data) { router.push('/login'); return }
        if ((data.user as { role?: string })?.role !== 'ADMIN') { router.push('/dashboard'); return }
        await Promise.all([loadNotices(), loadCourses()])
      } catch (e) { console.error(e) }
      finally { setIsLoading(false) }
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadNotices = async () => {
    const res = await fetch('/api/admin/notices')
    const d = await res.json()
    if (d.success) setNotices(d.notices)
  }

  const loadCourses = async () => {
    const res = await fetch('/api/admin/courses')
    if (res.ok) setCourses(await res.json())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: any = { ...form, courseId: form.courseId || null }
      if (editing) body.id = editing.id
      const res = await fetch('/api/admin/notices', { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const d = await res.json()
      if (!d.success) throw new Error(d.error)
      toast.success(editing ? 'Notice updated!' : 'Notice created!')
      closeModal()
      await loadNotices()
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notice?')) return
    try {
      const res = await fetch(`/api/admin/notices?id=${id}`, { method: 'DELETE' })
      const d = await res.json()
      if (!d.success) throw new Error(d.error)
      toast.success('Notice deleted')
      setNotices(prev => prev.filter(n => n.id !== id))
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Failed') }
  }

  const openEdit = (notice: Notice) => {
    setEditing(notice)
    setForm({ title: notice.title, content: notice.content, priority: notice.priority, courseId: notice.course?.id || '' })
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditing(null); setForm(EMPTY_FORM) }

  const filtered = filterPriority ? notices.filter(n => n.priority === filterPriority) : notices
  const urgentCount = notices.filter(n => n.priority === 'urgent').length

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-indigo-600/20 border-t-indigo-600 animate-spin" />
          <p className="text-gray-500 font-medium">Loading notices…</p>
        </div>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* Header */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #4f46e5 100%)' }}>
          <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-8 w-64 h-64 rounded-full bg-white/5" />
          <div className="relative px-8 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="text-indigo-300 text-sm font-medium">Admin Panel</p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">Notices</h1>
              <p className="mt-1 text-indigo-200 text-sm">Create and manage announcements for your students</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: 'Total', value: notices.length, cls: 'bg-white/15 text-white' },
                  { label: 'Urgent', value: urgentCount, cls: 'bg-red-500/30 text-red-200' },
                ].map(s => (
                  <div key={s.label} className={`px-4 py-2 rounded-2xl ${s.cls} text-center min-w-[68px]`}>
                    <p className="text-xl font-black">{s.value}</p>
                    <p className="text-xs font-medium opacity-80">{s.label}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex-shrink-0 flex items-center gap-2 bg-white text-indigo-700 font-bold px-5 py-2.5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                New Notice
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-2 flex-wrap">
          {[{ v: '', l: 'All Priorities' }, { v: 'urgent', l: '🚨 Urgent' }, { v: 'high', l: '🔔 High' }, { v: 'normal', l: '📢 Normal' }, { v: 'low', l: '📌 Low' }].map(opt => (
            <button key={opt.v} onClick={() => setFilterPriority(opt.v)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filterPriority === opt.v ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {opt.l}
            </button>
          ))}
        </div>

        {/* Notice list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4">📢</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No notices yet</h3>
            <p className="text-gray-400 text-sm mb-6">Create an announcement to keep students informed</p>
            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Create Notice
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(notice => {
              const meta = PRIORITY_META[notice.priority] || PRIORITY_META.normal
              return (
                <div key={notice.id} className={`group bg-white rounded-2xl border border-gray-100 border-l-4 ${meta.border} shadow-sm hover:shadow-md transition-all p-5`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                        {meta.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${meta.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                          {notice.course && (
                            <span className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                              📚 {notice.course.title}
                            </span>
                          )}
                          {!notice.course && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">🌐 All Students</span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1.5">{notice.title}</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed line-clamp-3">{notice.content}</p>
                        <p className="text-xs text-gray-400 mt-2.5 flex items-center gap-2">
                          <span>By {notice.author.name || notice.author.email}</span>
                          <span>·</span>
                          <span>{fmt(notice.createdAt)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => openEdit(notice)} title="Edit" className="p-2 rounded-xl hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(notice.id)} title="Delete" className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onMouseDown={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)' }}>
              <div>
                <h2 className="text-lg font-bold text-white">{editing ? '✏️ Edit Notice' : '📢 New Notice'}</h2>
                <p className="text-indigo-300 text-sm mt-0.5">{editing ? 'Update announcement details' : 'Create an announcement for students'}</p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto">
              <div className="p-6 space-y-4">
                <div>
                  <label className={labelCls}>Title *</label>
                  <input type="text" required value={form.title} onChange={e => set('title', e.target.value)} className={inputCls} placeholder="e.g., Exam Schedule Update" />
                </div>

                <div>
                  <label className={labelCls}>Content *</label>
                  <textarea rows={4} required value={form.content} onChange={e => set('content', e.target.value)} className={inputCls} placeholder="Notice details…" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Priority</label>
                    <select value={form.priority} onChange={e => set('priority', e.target.value)} className={inputCls}>
                      <option value="low">📌 Low</option>
                      <option value="normal">📢 Normal</option>
                      <option value="high">🔔 High</option>
                      <option value="urgent">🚨 Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Target Course</label>
                    <select value={form.courseId} onChange={e => set('courseId', e.target.value)} className={inputCls}>
                      <option value="">🌐 All Students</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                </div>

                {/* Priority preview */}
                {form.priority && (
                  <div className={`rounded-xl border-l-4 ${PRIORITY_META[form.priority]?.border} bg-gray-50 p-3 text-xs text-gray-500`}>
                    Preview: <span className={`font-semibold ${PRIORITY_META[form.priority]?.color.split(' ')[1]}`}>{PRIORITY_META[form.priority]?.emoji} {form.title || 'Your notice title'}</span>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex gap-3 flex-shrink-0">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition disabled:opacity-50">
                  {saving ? 'Saving…' : editing ? 'Update Notice' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}