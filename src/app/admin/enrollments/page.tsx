'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import toast from 'react-hot-toast'
import ConfirmModal from '@/components/ui/ConfirmModal'

interface Enrollment {
  id: string
  userId: string
  courseId: string
  enrolledAt: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestMessage: string | null
  responseMessage: string | null
  user: { id: string; name: string | null; email: string }
  course: { id: string; title: string; slug: string; category: string }
}

const STATUS_META = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border border-amber-200', dot: 'bg-amber-500', icon: '⏳' },
  APPROVED: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500', icon: '✅' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700 border border-red-200', dot: 'bg-red-500', icon: '❌' },
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminEnrollmentsPage() {
  const [session, setSession] = useState<unknown>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState<Enrollment | null>(null)
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null)
  const [responseText, setResponseText] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      try {
        const { data } = await authClient.getSession()
        if (!data) { router.push('/login'); return }
        if ((data.user as { role?: string })?.role !== 'ADMIN') { router.push('/dashboard'); return }
        setSession(data)
      } catch (e) { console.error(e) }
      finally { setPageLoading(false) }
    }
    init()
  }, [router])

  useEffect(() => {
    if (!session) return
    async function load() {
      try {
        const url = statusFilter ? `/api/admin/enrollments?status=${statusFilter}` : '/api/admin/enrollments'
        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed')
        setEnrollments(await res.json())
      } catch { toast.error('Failed to load enrollments') }
    }
    load()
  }, [session, statusFilter])

  const filtered = useMemo(() => {
    if (!search) return enrollments
    const s = search.toLowerCase()
    return enrollments.filter(e =>
      e.user.name?.toLowerCase().includes(s) ||
      e.user.email.toLowerCase().includes(s) ||
      e.course.title.toLowerCase().includes(s)
    )
  }, [enrollments, search])

  const stats = useMemo(() => ({
    total: enrollments.length,
    pending: enrollments.filter(e => e.status === 'PENDING').length,
    approved: enrollments.filter(e => e.status === 'APPROVED').length,
    rejected: enrollments.filter(e => e.status === 'REJECTED').length,
  }), [enrollments])

  const handleProcess = async () => {
    if (!showModal || !modalAction) return
    setProcessingId(showModal.id)
    try {
      const res = await fetch('/api/admin/enrollments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId: showModal.id, status: modalAction === 'approve' ? 'APPROVED' : 'REJECTED', responseMessage: responseText || undefined })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(data.message)
      setEnrollments(prev => prev.map(e => e.id === showModal.id ? { ...e, status: modalAction === 'approve' ? 'APPROVED' : 'REJECTED', responseMessage: responseText } : e))
      setShowModal(null); setModalAction(null); setResponseText('')
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setProcessingId(null) }
  }

  const handleDelete = async (id: string) => {
    setDeleteConfirm(null)
    try {
      const res = await fetch(`/api/admin/enrollments?id=${id}`, { method: 'DELETE' })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      setEnrollments(prev => prev.filter(e => e.id !== id))
      toast.success('Enrollment deleted')
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed') }
  }

  if (pageLoading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-indigo-600/20 border-t-indigo-600 animate-spin" />
          <p className="text-gray-500 font-medium">Loading enrollments…</p>
        </div>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #4f46e5 100%)' }}>
          <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-8 w-64 h-64 rounded-full bg-white/5" />
          <div className="relative px-6 sm:px-8 py-6 sm:py-7 flex flex-col gap-5">
            <div>
              <p className="text-indigo-300 text-xs sm:text-sm font-medium">Admin Panel</p>
              <h1 className="mt-1 text-xl sm:text-2xl md:text-3xl font-extrabold text-white">Enrollments</h1>
              <p className="mt-1 text-indigo-200 text-xs sm:text-sm">Review, approve or reject student enrollment requests</p>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              {[
                { label: 'Total', value: stats.total, cls: 'bg-white/15 text-white' },
                { label: 'Pending', value: stats.pending, cls: 'bg-amber-500/30 text-amber-200' },
                { label: 'Approved', value: stats.approved, cls: 'bg-emerald-500/30 text-emerald-200' },
                { label: 'Rejected', value: stats.rejected, cls: 'bg-red-500/30 text-red-200' },
              ].map(s => (
                <div key={s.label} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl ${s.cls} text-center min-w-[56px] sm:min-w-[68px]`}>
                  <p className="text-lg sm:text-xl font-black">{s.value}</p>
                  <p className="text-[10px] sm:text-xs font-medium opacity-80">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending alert */}
        {stats.pending > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl">⏳</span>
              <div>
                <p className="font-bold text-amber-900 text-xs sm:text-sm">{stats.pending} request{stats.pending !== 1 ? 's' : ''} awaiting review</p>
                <p className="text-[10px] sm:text-xs text-amber-700">Review and take action below</p>
              </div>
            </div>
            <button onClick={() => setStatusFilter('PENDING')} className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition">Show Pending</button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex flex-col gap-3">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search student or course…" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[{ v: '', l: 'All' }, { v: 'PENDING', l: '⏳ Pending' }, { v: 'APPROVED', l: '✅ Approved' }, { v: 'REJECTED', l: '❌ Rejected' }].map(opt => (
              <button key={opt.v} onClick={() => setStatusFilter(opt.v)} className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${statusFilter === opt.v ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {opt.l}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {['Student', 'Course', 'Requested', 'Status', 'Message', 'Actions'].map((h, i) => (
                    <th key={h} className={`px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 sm:py-16">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl">📋</div>
                      <p className="font-semibold text-gray-600 text-sm sm:text-base">No enrollments found</p>
                      <p className="text-xs sm:text-sm">Try adjusting the filter or search</p>
                    </div>
                  </td></tr>
                ) : filtered.map(e => {
                  const meta = STATUS_META[e.status]
                  return (
                    <tr key={e.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                            {e.user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{e.user.name || 'Unknown'}</p>
                            <p className="text-[10px] sm:text-xs text-gray-400 truncate max-w-[120px] sm:max-w-[140px]">{e.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1">{e.course.title}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400">{e.course.category}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs text-gray-400 whitespace-nowrap">{fmt(e.enrolledAt)}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${meta.color}`}>
                          <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 max-w-[140px] sm:max-w-[160px]">
                        {e.requestMessage && <p className="text-[10px] sm:text-xs text-gray-500 italic truncate">"{e.requestMessage}"</p>}
                        {e.responseMessage && <p className="text-[10px] sm:text-xs text-indigo-500 truncate mt-0.5">↳ {e.responseMessage}</p>}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                          {e.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => { setShowModal(e); setModalAction('approve'); setResponseText('') }}
                                disabled={processingId === e.id}
                                className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs font-semibold rounded-xl transition disabled:opacity-50"
                              >✅ Approve</button>
                              <button
                                onClick={() => { setShowModal(e); setModalAction('reject'); setResponseText('') }}
                                disabled={processingId === e.id}
                                className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] sm:text-xs font-semibold rounded-xl transition disabled:opacity-50"
                              >❌ Reject</button>
                            </>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(e.id)}
                              className="p-1.5 sm:p-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-600 transition"
                              title="Delete"
                            >
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-t border-gray-100 bg-gray-50/40 text-[10px] sm:text-xs text-gray-400">
              Showing {filtered.length} of {enrollments.length} enrollments
            </div>
          )}
        </div>
      </div>

      {/* Approve / Reject Modal */}
      {showModal && modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between" style={{ background: modalAction === 'approve' ? 'linear-gradient(135deg, #064e3b, #059669)' : 'linear-gradient(135deg, #7f1d1d, #dc2626)' }}>
              <div>
                <h3 className="text-lg font-bold text-white">{modalAction === 'approve' ? '✅ Approve Enrollment' : '❌ Reject Enrollment'}</h3>
                <p className="text-sm text-white/70 mt-0.5">{showModal.user.name || showModal.user.email}</p>
              </div>
              <button onClick={() => { setShowModal(null); setModalAction(null) }} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                <p className="text-gray-600"><span className="font-semibold text-gray-800">Course:</span> {showModal.course.title}</p>
                {showModal.requestMessage && (
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <p className="text-xs text-gray-400 mb-1">Student&apos;s message:</p>
                    <p className="text-gray-700 italic">&ldquo;{showModal.requestMessage}&rdquo;</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Response Message <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  rows={3}
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder={modalAction === 'approve' ? 'Welcome to the course!' : 'Reason for rejection…'}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex gap-3">
              <button onClick={() => { setShowModal(null); setModalAction(null) }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition">Cancel</button>
              <button
                onClick={handleProcess}
                disabled={processingId === showModal.id}
                className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition disabled:opacity-50 ${modalAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {processingId === showModal.id ? 'Processing…' : modalAction === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}