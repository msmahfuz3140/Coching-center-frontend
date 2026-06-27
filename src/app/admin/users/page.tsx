'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import toast from 'react-hot-toast'

type UserRow = {
  id: string
  name: string | null
  email: string
  role: 'ADMIN' | 'STUDENT'
  emailVerified: boolean
  createdAt: string
  isBlocked?: boolean
}


export default function AdminUsersPage() {
  const [session, setSession] = useState<any>(null)
  const [users, setUsers] = useState<UserRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
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
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
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
                      <div className="flex items-center justify-end gap-2">
                        {user.isBlocked ? (
                          <button
                            type="button"
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
                                if (!res.ok || !result.success) throw new Error(result.message || 'Failed to unblock')
                                setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isBlocked: false } : u)))
                                toast.success('User unblocked')
                              } catch (err: any) {
                                toast.error(err?.message || 'Failed to unblock')
                              } finally {
                                setIsUpdating(null)
                              }
                            }}
                            disabled={isUpdating === user.id}
                            className="px-3 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-600 transition"
                            aria-label={`Unblock ${user.email}`}
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            type="button"
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
                                if (!res.ok || !result.success) throw new Error(result.message || 'Failed to block')
                                setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isBlocked: true } : u)))
                                toast.success('User blocked')
                              } catch (err: any) {
                                toast.error(err?.message || 'Failed to block')
                              } finally {
                                setIsUpdating(null)
                              }
                            }}
                            disabled={isUpdating === user.id}
                            className="px-3 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-600 transition"
                            aria-label={`Block ${user.email}`}
                          >
                            Block
                          </button>
                        )}

                        <button
                          type="button"
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
                              if (!res.ok || !result.success) throw new Error(result.message || 'Failed to delete')
                              setUsers((prev) => prev.filter((u) => u.id !== user.id))
                              toast.success('User deleted')
                            } catch (err: any) {
                              toast.error(err?.message || 'Failed to delete')
                            } finally {
                              setIsUpdating(null)
                            }
                          }}
                          disabled={isUpdating === user.id}
                          className="px-3 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-black disabled:bg-gray-300 disabled:text-gray-600 transition"
                          aria-label={`Delete ${user.email}`}
                        >
                          Delete
                        </button>
                      </div>

                      <select
                        aria-label={`Change role for ${user.email}`}
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as 'ADMIN' | 'STUDENT')}
                        disabled={isUpdating === user.id}
                        className="mt-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
                      >

                        <option value="STUDENT">Student</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
