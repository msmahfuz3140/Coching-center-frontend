'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { authClient } from '@/lib/auth-client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ConfirmModal from '@/components/ui/ConfirmModal'

type UserRow = {
  id: string
  name: string | null
  email: string
  role: 'ADMIN' | 'STUDENT'
  emailVerified: boolean
  createdAt: string
  isBlocked?: boolean
}

type CourseRow = {
  id: string
  title: string
  slug: string
  category: string | null
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<'ALL' | 'ADMIN' | 'STUDENT'>('ALL')

  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; color: 'red' | 'amber' | 'emerald'; label: string; onConfirm: () => void } | null>(null)

  const [isCourseAccessModalOpen, setIsCourseAccessModalOpen] = useState(false)
  const [activeCourseAccessUserId, setActiveCourseAccessUserId] = useState<string | null>(null)
  const [activeUserName, setActiveUserName] = useState('')
  const [courseAccessCourses, setCourseAccessCourses] = useState<CourseRow[]>([])
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(new Set())
  const [isLoadingCourseAccess, setIsLoadingCourseAccess] = useState(false)
  const [isSavingCourseAccess, setIsSavingCourseAccess] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await authClient.getSession()
        if (!data) { router.push('/login'); return }
        if ((data.user as { role?: string })?.role !== 'ADMIN') { router.push('/dashboard'); return }
        const res = await fetch('/api/admin/users')
        const result = await res.json()
        if (result.success) setUsers(result.users)
      } catch (e) { console.error(e) }
      finally { setIsLoading(false) }
    }
    void init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => users.filter(u => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = filterRole === 'ALL' || u.role === filterRole
    return matchSearch && matchRole
  }), [users, search, filterRole])

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    students: users.filter(u => u.role === 'STUDENT').length,
    blocked: users.filter(u => u.isBlocked).length,
  }), [users])

  const handleRoleChange = async (userId: string, role: 'ADMIN' | 'STUDENT') => {
    setIsUpdating(userId)
    try {
      const res = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, role }) })
      const result = await res.json()
      if (!result.success) throw new Error(result.message)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: result.user.role } : u))
      toast.success(`Role updated to ${role}`)
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setIsUpdating(null) }
  }

  const triggerAction = (userId: string, action: 'BLOCK' | 'UNBLOCK' | 'DELETE') => {
    const configs = {
      DELETE: { title: 'Delete User', message: 'This will permanently delete the user and all their data. This action cannot be undone.', color: 'red' as const, label: 'Yes, Delete' },
      BLOCK: { title: 'Block User', message: 'This user will be blocked and won\'t be able to log in or access any courses.', color: 'amber' as const, label: 'Yes, Block' },
      UNBLOCK: { title: 'Unblock User', message: 'This user will be unblocked and regain access to their account.', color: 'emerald' as const, label: 'Yes, Unblock' },
    }
    const cfg = configs[action]
    setConfirmModal({ ...cfg, onConfirm: () => { setConfirmModal(null); handleAction(userId, action) } })
  }

  const handleAction = async (userId: string, action: 'BLOCK' | 'UNBLOCK' | 'DELETE') => {
    setIsUpdating(userId)
    try {
      const res = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, action }) })
      const result = await res.json()
      if (!result.success) throw new Error(result.message)
      if (action === 'DELETE') setUsers(prev => prev.filter(u => u.id !== userId))
      else setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: action === 'BLOCK' } : u))
      toast.success(`User ${action.toLowerCase()}ed`)
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setIsUpdating(null) }
  }

  const openCourseAccessModal = async (userId: string, userName: string) => {
    setActiveCourseAccessUserId(userId)
    setActiveUserName(userName)
    setIsCourseAccessModalOpen(true)
    setIsLoadingCourseAccess(true)
    setCourseAccessCourses([])
    setSelectedCourseIds(new Set())
    try {
      const res = await fetch(`/api/admin/users/course-access?userId=${userId}`)
      const result = await res.json()
      if (!result.success) throw new Error(result.message)
      setCourseAccessCourses(result.courses ?? [])
      setSelectedCourseIds(new Set(result.approvedCourseIds ?? []))
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setIsLoadingCourseAccess(false) }
  }

  const closeCourseAccessModal = () => {
    setIsCourseAccessModalOpen(false)
    setActiveCourseAccessUserId(null)
    setActiveUserName('')
    setCourseAccessCourses([])
    setSelectedCourseIds(new Set())
  }

  const saveCourseAccess = async () => {
    if (!activeCourseAccessUserId) return
    setIsSavingCourseAccess(true)
    try {
      const res = await fetch('/api/admin/users/course-access', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: activeCourseAccessUserId, courseIds: Array.from(selectedCourseIds) }) })
      const result = await res.json()
      if (!result.success) throw new Error(result.message)
      toast.success('Course access updated')
      closeCourseAccessModal()
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setIsSavingCourseAccess(false) }
  }

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-indigo-600/20 border-t-indigo-600 animate-spin" />
          <p className="text-gray-500 font-medium">Loading users…</p>
        </div>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #4f46e5 100)' }}>
          <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-8 w-64 h-64 rounded-full bg-white/5" />
          <div className="relative px-6 sm:px-8 py-6 sm:py-7 flex flex-col gap-5">
            <div>
              <p className="text-indigo-300 text-xs sm:text-sm font-medium tracking-wide">Admin Panel</p>
              <h1 className="mt-1 text-xl sm:text-2xl md:text-3xl font-extrabold text-white">Manage Users</h1>
              <p className="mt-1 text-indigo-200 text-xs sm:text-sm">View, manage roles, block or grant course access</p>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              {[
                { label: 'Total', value: stats.total, color: 'bg-white/15 text-white' },
                { label: 'Students', value: stats.students, color: 'bg-blue-500/30 text-blue-200' },
                { label: 'Admins', value: stats.admins, color: 'bg-violet-500/30 text-violet-200' },
                { label: 'Blocked', value: stats.blocked, color: 'bg-red-500/30 text-red-200' },
              ].map(s => (
                <div key={s.label} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl ${s.color} text-center min-w-[56px] sm:min-w-[72px]`}>
                  <p className="text-lg sm:text-xl font-black">{s.value}</p>
                  <p className="text-[10px] sm:text-xs font-medium opacity-80">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex flex-col gap-3">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {(['ALL', 'STUDENT', 'ADMIN'] as const).map(r => (
              <button key={r} onClick={() => setFilterRole(r)}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${filterRole === r ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {r === 'ALL' ? 'All' : r === 'STUDENT' ? '🎓 Students' : '👑 Admins'}
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
                  {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h, i) => (
                    <th key={h} className={`px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 sm:py-16 text-gray-400 text-xs sm:text-sm">No users found</td></tr>
                ) : filtered.map(user => (
                  <tr key={user.id} className={`hover:bg-gray-50/60 transition-colors ${isUpdating === user.id ? 'opacity-50' : ''}`}>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0 shadow-sm">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{user.name || 'Unnamed'}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 max-w-[150px] sm:max-w-[200px] truncate">{user.email}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role === 'ADMIN' ? '👑' : '🎓'} {user.role}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${user.emailVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {user.emailVerified ? '✓ Verified' : '⏳ Pending'}
                        </span>
                        {user.isBlocked && <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-red-100 text-red-700">🚫 Blocked</span>}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs text-gray-400 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        {/* Role toggle */}
                        <button
                          onClick={() => handleRoleChange(user.id, user.role === 'ADMIN' ? 'STUDENT' : 'ADMIN')}
                          disabled={isUpdating === user.id}
                          title={`Make ${user.role === 'ADMIN' ? 'Student' : 'Admin'}`}
                          className="p-1.5 sm:p-2 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-500 hover:text-violet-600 transition-all disabled:opacity-40"
                        >
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </button>
                        {/* Course access */}
                        <button
                          onClick={() => openCourseAccessModal(user.id, user.name || user.email)}
                          title="Course Access"
                          className="p-1.5 sm:p-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all"
                        >
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </button>
                        {/* Block / Unblock */}
                        <button
                          onClick={() => triggerAction(user.id, user.isBlocked ? 'UNBLOCK' : 'BLOCK')}
                          disabled={isUpdating === user.id}
                          title={user.isBlocked ? 'Unblock' : 'Block'}
                          className={`p-1.5 sm:p-2 rounded-xl border transition-all disabled:opacity-40 ${user.isBlocked ? 'border-emerald-200 hover:bg-emerald-50 text-emerald-600' : 'border-amber-200 hover:bg-amber-50 text-amber-600'}`}
                        >
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={user.isBlocked ? 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' : 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'} /></svg>
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => triggerAction(user.id, 'DELETE')}
                          disabled={isUpdating === user.id}
                          title="Delete"
                          className="p-1.5 sm:p-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-600 transition-all disabled:opacity-40"
                        >
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-t border-gray-100 bg-gray-50/40 text-[10px] sm:text-xs text-gray-400">
              Showing {filtered.length} of {users.length} users
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!confirmModal}
        title={confirmModal?.title || ''}
        message={confirmModal?.message || ''}
        confirmLabel={confirmModal?.label || 'Confirm'}
        confirmColor={confirmModal?.color || 'red'}
        isLoading={!!isUpdating}
        onConfirm={confirmModal?.onConfirm || (() => { })}
        onCancel={() => setConfirmModal(null)}
      />

      {/* Course Access Modal */}
      {isCourseAccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onMouseDown={e => { if (e.target === e.currentTarget) closeCourseAccessModal() }}>
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">📚 Course Access</h2>
                  <p className="text-sm text-indigo-300 mt-0.5">{activeUserName}</p>
                </div>
                <button onClick={closeCourseAccessModal} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition">✕</button>
              </div>
            </div>

            <div className="p-6">
              {isLoadingCourseAccess ? (
                <div className="flex justify-center py-10">
                  <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                </div>
              ) : courseAccessCourses.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No courses available</div>
              ) : (
                <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
                  <p className="text-xs text-gray-400 mb-3">{selectedCourseIds.size} of {courseAccessCourses.length} courses selected</p>
                  {courseAccessCourses.map(course => {
                    const checked = selectedCourseIds.has(course.id)
                    return (
                      <label key={course.id} className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${checked ? 'border-indigo-300 bg-indigo-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${checked ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                          {checked && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <input type="checkbox" checked={checked} onChange={() => setSelectedCourseIds(prev => { const n = new Set(prev); n.has(course.id) ? n.delete(course.id) : n.add(course.id); return n })} className="sr-only" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{course.title}</p>
                          {course.category && <p className="text-xs text-gray-400">{course.category}</p>}
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex gap-3">
              <button onClick={closeCourseAccessModal} disabled={isSavingCourseAccess} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition disabled:opacity-50">Cancel</button>
              <button onClick={saveCourseAccess} disabled={isSavingCourseAccess || isLoadingCourseAccess} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition disabled:opacity-50">
                {isSavingCourseAccess ? 'Saving…' : 'Save Access'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
