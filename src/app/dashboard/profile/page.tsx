'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import toast from 'react-hot-toast'

type SessionUser = {
  id: string
  name?: string | null
  email?: string
  role?: string
  createdAt?: string | Date
  image?: string | null
  emailVerified?: boolean
}

type EnrollmentStats = {
  enrolledCount: number
  completedCount: number
  pendingCount: number
}

type AdminStats = {
  totalUsers: number
  totalCourses: number
  totalEnrollments: number
  pendingEnrollments: number
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [enrollmentStats, setEnrollmentStats] = useState<EnrollmentStats>({
    enrolledCount: 0,
    completedCount: 0,
    pendingCount: 0,
  })
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload/profile', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      await authClient.updateUser({ image: data.imageUrl })
      setUser((prev) => (prev ? { ...prev, image: data.imageUrl } : prev))
      toast.success('Profile picture updated!')
      router.refresh() // refresh so navbar/sidebar picks up new image
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const { data } = await authClient.getSession()
        if (!data) {
          router.push('/login')
          return
        }
        setUser(data.user as SessionUser)
        setEditName((data.user as SessionUser).name || '')

        const role = (data.user as SessionUser).role
        if (role === 'ADMIN') {
          // load admin stats
          const res = await fetch('/api/admin/stats')
          const d = await res.json()
          if (d.success) setAdminStats(d.stats)
        } else {
          // load enrollment stats
          const res = await fetch('/api/enrollments')
          const d = await res.json()
          // API returns array directly
          const enrollments: { status: string }[] = Array.isArray(d) ? d : (d.enrollments || [])
          setEnrollmentStats({
            enrolledCount: enrollments.filter((e) => e.status === 'APPROVED').length,
            completedCount: enrollments.filter((e) => e.status === 'COMPLETED').length,
            pendingCount: enrollments.filter((e) => e.status === 'PENDING').length,
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [router])

  const initials = useMemo(() => {
    const n = user?.name || 'User'
    return n
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('')
  }, [user?.name])

  const createdAtLabel = useMemo(() => {
    if (!user?.createdAt) return 'N/A'
    const d = typeof user.createdAt === 'string' ? new Date(user.createdAt) : user.createdAt
    return isNaN(d.getTime())
      ? 'N/A'
      : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }, [user?.createdAt])

  const isAdmin = user?.role === 'ADMIN'

  async function handleSaveProfile() {
    if (!editName.trim()) {
      toast.error('Name cannot be empty')
      return
    }
    setIsSaving(true)
    try {
      await authClient.updateUser({ name: editName.trim() })
      setUser((prev) => (prev ? { ...prev, name: editName.trim() } : prev))
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleChangePassword() {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('All fields are required')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setIsSavingPassword(true)
    try {
      await authClient.changePassword({
        currentPassword: oldPassword,
        newPassword: newPassword,
        revokeOtherSessions: false,
      })
      toast.success('Password changed successfully!')
      setIsChangingPassword(false)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      toast.error('Failed to change password. Check your current password.')
    } finally {
      setIsSavingPassword(false)
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

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Hero Banner */}
        <div
          className="rounded-2xl p-8 text-white shadow-xl relative overflow-hidden"
          style={{
            background: isAdmin
              ? 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)'
              : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #38bdf8 100%)',
          }}
        >
          {/* decorative circles */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10 bg-white" />
          <div className="absolute -bottom-16 -left-8 w-64 h-64 rounded-full opacity-5 bg-white" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar with upload on hover */}
            <div
              className="relative w-24 h-24 flex-shrink-0 cursor-pointer"
              onMouseEnter={() => setIsHoveringAvatar(true)}
              onMouseLeave={() => setIsHoveringAvatar(false)}
              onClick={() => !isUploadingImage && fileInputRef.current?.click()}
              title="Click to change profile picture"
            >
              {/* Avatar circle */}
              <div className="w-24 h-24 rounded-full border-4 border-white/40 bg-white/20 flex items-center justify-center text-3xl font-black shadow-lg overflow-hidden">
                {isUploadingImage ? (
                  <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt="avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              {/* Hover overlay with camera icon */}
              <div
                className="absolute inset-0 rounded-full flex flex-col items-center justify-center transition-all duration-200"
                style={{
                  background: isHoveringAvatar && !isUploadingImage ? 'rgba(0,0,0,0.55)' : 'transparent',
                  opacity: isHoveringAvatar && !isUploadingImage ? 1 : 0,
                }}
              >
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-white text-xs font-semibold mt-1">Change</span>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold">{user.name || 'User'}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isAdmin ? 'bg-amber-400 text-amber-900' : 'bg-blue-200 text-blue-900'
                  }`}
                >
                  {isAdmin ? '👑 ADMIN' : '🎓 STUDENT'}
                </span>
                {user.emailVerified && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-400/20 text-green-200 border border-green-400/30">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="mt-1 text-blue-100 text-sm break-all">{user.email}</p>
              <p className="mt-1 text-blue-200 text-xs">📅 Member since {createdAtLabel}</p>
            </div>

            {/* Edit button */}
            <button
              onClick={() => setIsEditing(true)}
              type="button"
              className="flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white px-4 py-2 text-sm font-semibold transition-all"
            >
              ✏️ Edit Profile
            </button>
          </div>
        </div>

        {/* Stats Row */}
        {isAdmin ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: adminStats?.totalUsers ?? 0, color: 'from-blue-500 to-blue-600', icon: '👥' },
              { label: 'Total Courses', value: adminStats?.totalCourses ?? 0, color: 'from-purple-500 to-purple-600', icon: '📚' },
              { label: 'Total Enrollments', value: adminStats?.totalEnrollments ?? 0, color: 'from-emerald-500 to-emerald-600', icon: '✅' },
              { label: 'Pending Requests', value: adminStats?.pendingEnrollments ?? 0, color: 'from-amber-500 to-orange-500', icon: '⏳' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center">
                <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} items-center justify-center text-2xl mb-3 shadow-md`}>
                  {s.icon}
                </div>
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Active Courses', value: enrollmentStats.enrolledCount, color: 'from-blue-500 to-blue-600', icon: '📘' },
              { label: 'Completed', value: enrollmentStats.completedCount, color: 'from-emerald-500 to-green-600', icon: '🏆' },
              { label: 'Pending Enrollment', value: enrollmentStats.pendingCount, color: 'from-amber-500 to-orange-500', icon: '⏳' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center">
                <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} items-center justify-center text-2xl mb-3 shadow-md`}>
                  {s.icon}
                </div>
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-base">ℹ️</span>
                Account Information
              </h2>
              <div className="divide-y divide-gray-100">
                {[
                  { label: 'Full Name', value: user.name || '—' },
                  { label: 'Email Address', value: user.email || '—' },
                  { label: 'Role', value: isAdmin ? 'Administrator' : 'Student' },
                  { label: 'Email Verified', value: user.emailVerified ? '✅ Yes' : '❌ No' },
                  { label: 'Member Since', value: createdAtLabel },
                ].map((row) => (
                  <div key={row.label} className="py-3 flex items-center justify-between gap-4">
                    <span className="text-sm text-gray-500 font-medium w-40 flex-shrink-0">{row.label}</span>
                    <span className="text-sm text-gray-900 font-semibold text-right break-all">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-base">⚡</span>
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {isAdmin ? (
                  <>
                    <a href="/admin/users" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                      <span className="text-xl">👥</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">Manage Users</p>
                        <p className="text-xs text-gray-500">View & manage students</p>
                      </div>
                    </a>
                    <a href="/admin/courses" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                      <span className="text-xl">📚</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">Manage Courses</p>
                        <p className="text-xs text-gray-500">Create & edit courses</p>
                      </div>
                    </a>
                    <a href="/admin/enrollments" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all group">
                      <span className="text-xl">✅</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-amber-700">Enrollments</p>
                        <p className="text-xs text-gray-500">Approve/reject requests</p>
                      </div>
                    </a>
                    <a href="/admin/notices" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group">
                      <span className="text-xl">📢</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-green-700">Notices</p>
                        <p className="text-xs text-gray-500">Post announcements</p>
                      </div>
                    </a>
                  </>
                ) : (
                  <>
                    <a href="/dashboard/courses" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                      <span className="text-xl">📘</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">My Courses</p>
                        <p className="text-xs text-gray-500">View enrolled courses</p>
                      </div>
                    </a>
                    <a href="/dashboard/assignments" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group">
                      <span className="text-xl">📝</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-purple-700">Assignments</p>
                        <p className="text-xs text-gray-500">Check your tasks</p>
                      </div>
                    </a>
                    <a href="/dashboard/notices" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all group">
                      <span className="text-xl">🔔</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-amber-700">Notices</p>
                        <p className="text-xs text-gray-500">View announcements</p>
                      </div>
                    </a>
                    <a href="/courses" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group">
                      <span className="text-xl">🔍</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-green-700">Browse Courses</p>
                        <p className="text-xs text-gray-500">Explore new courses</p>
                      </div>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Security */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-base">🔒</span>
                Security
              </h2>
              <p className="text-sm text-gray-500 mb-4">Keep your account secure by updating your password regularly.</p>
              <button
                onClick={() => setIsChangingPassword(true)}
                type="button"
                className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-all"
              >
                🔑 Change Password
              </button>
            </div>

            {/* Role Badge */}
            <div
              className="rounded-2xl p-6 text-white"
              style={{
                background: isAdmin
                  ? 'linear-gradient(135deg, #1e293b, #1e3a8a)'
                  : 'linear-gradient(135deg, #1e3a8a, #2563eb)',
              }}
            >
              <div className="text-center">
                <div className="text-5xl mb-3">{isAdmin ? '👑' : '🎓'}</div>
                <h3 className="text-xl font-bold">{isAdmin ? 'Administrator' : 'Student'}</h3>
                <p className="text-blue-200 text-sm mt-2">
                  {isAdmin
                    ? 'You have full access to manage the coaching center platform.'
                    : 'You are enrolled as a student in the coaching center.'}
                </p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-xs text-blue-300">Account ID</p>
                  <p className="text-xs text-white font-mono mt-1 break-all opacity-70">{user.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">✏️ Edit Profile</h3>
              <button
                onClick={() => { setIsEditing(false); setEditName(user.name || '') }}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"
                type="button"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => { setIsEditing(false); setEditName(user.name || '') }}
                type="button"
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                type="button"
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition disabled:opacity-60"
              >
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">🔑 Change Password</h3>
              <button
                onClick={() => { setIsChangingPassword(false); setOldPassword(''); setNewPassword(''); setConfirmPassword('') }}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"
                type="button"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Min. 6 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Re-enter new password"
                />
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => { setIsChangingPassword(false); setOldPassword(''); setNewPassword(''); setConfirmPassword('') }}
                type="button"
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                type="button"
                disabled={isSavingPassword}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition disabled:opacity-60"
              >
                {isSavingPassword ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
