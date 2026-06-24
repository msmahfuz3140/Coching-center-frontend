'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import toast from 'react-hot-toast'
import UserProfileHeader from './_components/UserProfileHeader'
import CourseStatCard from './_components/CourseStatCard'

export default function ProfilePage() {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data } = await authClient.getSession()
        if (!data) {
          router.push('/login')
          return
        }
        setSession(data)
      } catch (error) {
        console.error('Failed to load session', error)
      } finally {
        setIsLoading(false)
      }
    }

    void loadSession()
  }, [router])

  const handleLogout = async () => {
    setIsSigningOut(true)
    try {
      await authClient.signOut()
      toast.success('Logged out successfully', { duration: 2000, position: 'top-right' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      toast.error('Failed to logout', { duration: 3000, position: 'top-right' })
    } finally {
      setIsSigningOut(false)
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

  const user = session?.user

  const createdAtLabel = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : 'N/A'

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account settings</p>
          </div>
          <div className="text-sm text-gray-500">Joined: {createdAtLabel}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <UserProfileHeader name={user?.name} email={user?.email} image={user?.image} />

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <CourseStatCard
                tone="blue"
                title="Role"
                value={(user?.role || 'STUDENT').toString()}
                subtitle="Authorization level"
              />
              <CourseStatCard
                tone="green"
                title="Email Verified"
                value={user?.emailVerified ? 'Yes' : 'No'}
                subtitle="Verification status"
              />
              <CourseStatCard
                tone="yellow"
                title="Status"
                value={user?.emailVerified ? 'Active' : 'Pending'}
                subtitle="Account state"
              />
            </div>

            <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50/50 p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Full Name</div>
                  <div className="font-semibold text-gray-900">{user?.name || 'Not set'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Email</div>
                  <div className="font-semibold text-gray-900 break-all">{user?.email || '—'}</div>
                </div>
              </div>

              <div className="mt-5">
                <button
                  onClick={handleLogout}
                  disabled={isSigningOut}
                  className="w-full sm:w-auto flex sm:inline-flex items-center justify-center gap-2 px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-semibold transition-all disabled:opacity-50"
                >
                  {isSigningOut ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Signing Out...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign Out
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

