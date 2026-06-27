'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

import { authClient } from '@/lib/auth-client'
import DashboardLayout from '@/components/layout/DashboardLayout'

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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const [isCourseAccessModalOpen, setIsCourseAccessModalOpen] = useState(false)
  const [activeCourseAccessUserId, setActiveCourseAccessUserId] = useState<string | null>(null)
  const [courseAccessCourses, setCourseAccessCourses] = useState<CourseRow[]>([])
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(new Set())
  const [isLoadingCourseAccess, setIsLoadingCourseAccess] = useState(false)
  const [isSavingCourseAccess, setIsSavingCourseAccess] = useState(false)

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
    } catch (error) {
      console.error(error)
      router.push('/login')
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to load users')
      }
      setUsers(result.users)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      await loadSession()
      await loadUsers()
    }
    void init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRoleChange = async (userId: string, role: 'ADMIN' | 'STUDENT') => {
    setIsUpdating(userId)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update role')
      }
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: result.user.role } : user)))
      toast.success(`Role updated to ${role}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role')
    } finally {
      setIsUpdating(null)
    }
  }

  const openCourseAccessModal = async (userId: string) => {
    setActiveCourseAccessUserId(userId)
    setIsCourseAccessModalOpen(true)

    setIsLoadingCourseAccess(true)
    setCourseAccessCourses([])
    setSelectedCourseIds(new Set())

    try {
      const res = await fetch(`/api/admin/users/course-access?userId=${userId}`)
      const result = await res.json()
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to load course access')
      }

      const fetchedCourses = (result.courses ?? []) as CourseRow[]
      const approvedCourseIds = (result.approvedCourseIds ?? []) as string[]

      setCourseAccessCourses(fetchedCourses)
      setSelectedCourseIds(new Set(approvedCourseIds))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load course access')
    } finally {
      setIsLoadingCourseAccess(false)
    }
  }

  const closeCourseAccessModal = () => {
    setIsCourseAccessModalOpen(false)
    setActiveCourseAccessUserId(null)
    setCourseAccessCourses([])
    setSelectedCourseIds(new Set())
    setIsLoadingCourseAccess(false)
    setIsSavingCourseAccess(false)
  }

  const toggleCourseId = (courseId: string) => {
    setSelectedCourseIds((prev) => {
      const next = new Set(prev)
      if (next.has(courseId)) next.delete(courseId)
      else next.add(courseId)
      return next
    })
  }

  const saveCourseAccess = async () => {
    if (!activeCourseAccessUserId) return

    setIsSavingCourseAccess(true)
    try {
      const res = await fetch('/api/admin/users/course-access', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeCourseAccessUserId, courseIds: Array.from(selectedCourseIds) }),
      })
      const result = await res.json()
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to update course access')
      }

      toast.success('Course access updated')
      closeCourseAccessModal()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update course access')
    } finally {
      setIsSavingCourseAccess(false)
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-600 mt-1">View and manage all users</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{user.name?.charAt(0) || 'U'}</span>
                        </div>
                        <span className="font-medium text-gray-900">{user.name || 'Unnamed'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-600">{user.email}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {user.emailVerified ? 'Verified' : 'Pending'}
                        </span>
                        {user.isBlocked && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Blocked
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end">
                        <div className="relative">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition"
                            aria-label={`User actions for ${user.email}`}
                            onClick={(e) => {
                              const el = (e.currentTarget as HTMLButtonElement).nextElementSibling as HTMLElement | null
                              if (!el) return
                              el.classList.toggle('hidden')
                            }}
                          >
                            <span className="text-xl leading-none">⋮</span>
                          </button>

                          <div className="hidden absolute right-0 mt-2 w-60 rounded-xl shadow-xl bg-white border border-gray-100 overflow-hidden z-20">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                              <p className="text-xs font-bold text-gray-600">Role</p>
                              <div className="mt-2 flex flex-col gap-2">
                                <button
                                  type="button"
                                  className={`px-3 py-2 text-left text-sm rounded-lg transition ${
                                    user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50 text-gray-700'
                                  }`}
                                  disabled={isUpdating === user.id}
                                  onClick={async () => {
                                    await handleRoleChange(user.id, 'ADMIN')
                                    const menu = (document.activeElement as HTMLElement)?.closest('div')?.querySelector('div.hidden')
                                    if (menu) menu.classList.add('hidden')
                                  }}
                                >
                                  Admin
                                </button>

                                <button
                                  type="button"
                                  className={`px-3 py-2 text-left text-sm rounded-lg transition ${
                                    user.role === 'STUDENT' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                                  }`}
                                  disabled={isUpdating === user.id}
                                  onClick={async () => {
                                    await handleRoleChange(user.id, 'STUDENT')
                                    const menu = (document.activeElement as HTMLElement)?.closest('div')?.querySelector('div.hidden')
                                    if (menu) menu.classList.add('hidden')
                                  }}
                                >
                                  Student
                                </button>
                              </div>
                            </div>

                            <div className="px-2 py-2">
                              <p className="px-3 pb-2 text-xs font-bold text-gray-600">Actions</p>

                              {user.isBlocked ? (
                                <button
                                  type="button"
                                  className="w-full px-3 py-2 text-sm text-left rounded-lg hover:bg-green-50 text-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={isUpdating === user.id}
                                  onClick={async () => {
                                    const ok = window.confirm('Unblock this user?')
                                    if (!ok) return

                                    setIsUpdating(user.id)
                                    try {
                                      const res = await fetch('/api/admin/users', {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ userId: user.id, action: 'UNBLOCK' }),
                                      })
                                      const result = await res.json()
                                      if (!res.ok || !result.success) {
                                        throw new Error(result.message || 'Failed to unblock')
                                      }
                                      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isBlocked: false } : u)))
                                      toast.success('User unblocked')
                                    } catch (err: any) {
                                      toast.error(err?.message || 'Failed to unblock')
                                    } finally {
                                      setIsUpdating(null)
                                    }
                                  }}
                                >
                                  Unblock
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="w-full px-3 py-2 text-sm text-left rounded-lg hover:bg-red-50 text-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={isUpdating === user.id}
                                  onClick={async () => {
                                    const ok = window.confirm('Block this user?')
                                    if (!ok) return

                                    setIsUpdating(user.id)
                                    try {
                                      const res = await fetch('/api/admin/users', {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ userId: user.id, action: 'BLOCK' }),
                                      })
                                      const result = await res.json()
                                      if (!res.ok || !result.success) {
                                        throw new Error(result.message || 'Failed to block')
                                      }
                                      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isBlocked: true } : u)))
                                      toast.success('User blocked')
                                    } catch (err: any) {
                                      toast.error(err?.message || 'Failed to block')
                                    } finally {
                                      setIsUpdating(null)
                                    }
                                  }}
                                >
                                  Block
                                </button>
                              )}

                              <button
                                type="button"
                                className="w-full px-3 py-2 mt-1 text-sm text-left rounded-lg hover:bg-gray-100 text-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isUpdating === user.id}
                                onClick={async () => {
                                  const ok = window.confirm('Delete this user? This cannot be undone.')
                                  if (!ok) return

                                  setIsUpdating(user.id)
                                  try {
                                    const res = await fetch('/api/admin/users', {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ userId: user.id, action: 'DELETE' }),
                                    })
                                    const result = await res.json()
                                    if (!res.ok || !result.success) {
                                      throw new Error(result.message || 'Failed to delete')
                                    }
                                    setUsers((prev) => prev.filter((u) => u.id !== user.id))
                                    toast.success('User deleted')
                                  } catch (err: any) {
                                    toast.error(err?.message || 'Failed to delete')
                                  } finally {
                                    setIsUpdating(null)
                                  }
                                }}
                              >
                                Delete
                              </button>

                              <button
                                type="button"
                                className="w-full px-3 py-2 mt-1 text-sm text-left rounded-lg hover:bg-blue-50 text-blue-700 transition"
                                onClick={async () => {
                                  await openCourseAccessModal(user.id)
                                }}
                              >
                                Course Access
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isCourseAccessModalOpen && activeCourseAccessUserId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeCourseAccessModal()
            }}
          >
            <div className="absolute inset-0 bg-black/40" />

            <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Course Access</h2>
                  <p className="text-sm text-gray-600">Select courses to give access</p>
                </div>

                <button
                  type="button"
                  onClick={closeCourseAccessModal}
                  className="w-10 h-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="px-5 py-4">
                {isLoadingCourseAccess ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
                    {courseAccessCourses.length === 0 ? (
                      <div className="text-sm text-gray-600">No courses found.</div>
                    ) : (
                      courseAccessCourses.map((course) => {
                        const checked = selectedCourseIds.has(course.id)
                        return (
                          <label
                            key={course.id}
                            className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2 hover:bg-gray-50 cursor-pointer transition"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleCourseId(course.id)}
                              className="h-4 w-4"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{course.title}</div>
                              {course.category ? (
                                <div className="text-xs text-gray-500">{course.category}</div>
                              ) : null}
                            </div>
                          </label>
                        )
                      })
                    )}
                  </div>
                )}
              </div>

              <div className="px-5 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeCourseAccessModal}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition disabled:opacity-50"
                  disabled={isSavingCourseAccess}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveCourseAccess}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSavingCourseAccess || isLoadingCourseAccess}
                >
                  {isSavingCourseAccess ? 'Saving...' : 'Update Access'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

