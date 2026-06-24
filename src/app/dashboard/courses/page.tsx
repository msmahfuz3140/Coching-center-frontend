'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'

interface EnrollmentWithCourse {
  id: string
  enrolledAt: string
  completedAt: string | null
  progress: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestMessage: string | null
  responseMessage: string | null
  reviewedAt: string | null
  course: {
    id: string
    title: string
    slug: string
    description?: string
    category: string
    thumbnail?: string
    instructor?: { id: string; name: string | null; email: string }
    _count?: { enrollments: number; videos: number }
    videos?: any[]
    syllabus?: any[]
  }
}

export default function MyCoursesPage() {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([])
  const router = useRouter()

  useEffect(() => {
    async function init() {
      try {
        const { data } = await authClient.getSession()
        if (!data) { router.push('/login'); return }
        setSession(data)
        
        // Fetch enrollments
        const res = await fetch('/api/enrollments')
        if (res.ok) {
          const data = await res.json()
          setEnrollments(data)
        }
      } catch (error) {
        console.error('Failed to load session', error)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [router])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending Approval
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        )
      default:
        return null
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

  const approvedEnrollments = enrollments.filter(e => e.status === 'APPROVED')
  const pendingEnrollments = enrollments.filter(e => e.status === 'PENDING')
  const rejectedEnrollments = enrollments.filter(e => e.status === 'REJECTED')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600 mt-1">Courses you are enrolled in</p>
          </div>
          {session?.user?.role === 'ADMIN' && (
            <Link
              href="/admin/courses"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Manage Courses
            </Link>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-green-700">{approvedEnrollments.length}</p>
            <p className="text-sm text-green-600">Active Courses</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-yellow-700">{pendingEnrollments.length}</p>
            <p className="text-sm text-yellow-600">Pending Requests</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-700">{rejectedEnrollments.length}</p>
            <p className="text-sm text-blue-600">Rejected</p>
          </div>
        </div>

        {/* Active Courses */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Active Courses</h2>
          {approvedEnrollments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Courses</h3>
              <p className="text-gray-600 mb-4">Browse courses and request access to get started.</p>
              <Link href="/courses" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="h-40 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center relative">
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(enrollment.status)}
                    </div>
                    <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{enrollment.course.category}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{enrollment.course.title}</h3>
                    {enrollment.course.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{enrollment.course.description}</p>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">{Math.round(enrollment.progress)}% complete</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-600 rounded-full" style={{ width: `${enrollment.progress}%` }} />
                      </div>
                    </div>
                    <Link
                      href={`/courses/${enrollment.course.slug}`}
                      className="mt-3 inline-block w-full text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Requests */}
        {pendingEnrollments.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Requests</h2>
            <div className="space-y-3">
              {pendingEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="bg-white rounded-xl shadow border border-yellow-100 p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{enrollment.course.title}</h3>
                    <p className="text-sm text-gray-500">
                      Requested on {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </p>
                    {enrollment.requestMessage && (
                      <p className="text-xs text-gray-400 mt-1 italic">{enrollment.requestMessage}</p>
                    )}
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Awaiting Approval
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected Requests */}
        {rejectedEnrollments.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rejected Requests</h2>
            <div className="space-y-3">
              {rejectedEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="bg-white rounded-xl shadow border border-red-100 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{enrollment.course.title}</h3>
                      <p className="text-sm text-gray-500">
                        Requested on {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Rejected
                    </span>
                  </div>
                  {enrollment.responseMessage && (
                    <div className="mt-2 p-3 bg-red-50 rounded-lg">
                      <p className="text-xs text-red-600 font-medium mb-1">Admin Response:</p>
                      <p className="text-sm text-red-700">{enrollment.responseMessage}</p>
                    </div>
                  )}
                  <Link
                    href={`/courses/${enrollment.course.slug}`}
                    className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Request Again →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {session?.user?.role === 'ADMIN' && (
          <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Admin Actions</h3>
            <div className="flex gap-3">
              <Link href="/admin/courses" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Course
              </Link>
              <Link href="/admin/enrollments" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Manage Enrollments
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}