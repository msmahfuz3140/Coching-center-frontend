'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import toast from 'react-hot-toast'

interface Enrollment {
  id: string
  userId: string
  courseId: string
  enrolledAt: string
  completedAt: string | null
  progress: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestMessage: string | null
  responseMessage: string | null
  reviewedAt: string | null
  user: {
    id: string
    name: string | null
    email: string
  }
  course: {
    id: string
    title: string
    slug: string
    category: string
  }
}

export default function AdminEnrollmentsPage() {
  const [session, setSession] = useState<any>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState<Enrollment | null>(null)
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null)
  const [responseText, setResponseText] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function init() {
      try {
        const { data } = await authClient.getSession()
        if (!data) { router.push('/login'); return }
        if ((data.user as { role?: string } | undefined)?.role !== 'ADMIN') { router.push('/dashboard'); return }
        setSession(data)
      } catch (error) {
        console.error(error)
      } finally {
        setPageLoading(false)
      }
    }
    init()
  }, [router])

  useEffect(() => {
    if (!session) return

    async function fetchEnrollments() {
      try {
        const token = session.token || ''
        let url = '/api/admin/enrollments'
        if (statusFilter) url += `?status=${statusFilter}`
        
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setEnrollments(data)
      } catch (error) {
        toast.error('Failed to load enrollments')
        console.error(error)
      }
    }
    fetchEnrollments()
  }, [session, statusFilter])

  const handleProcess = async () => {
    if (!showModal || !modalAction) return
    setProcessingId(showModal.id)
    try {
      const res = await fetch('/api/admin/enrollments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token || ''}`
        },
        body: JSON.stringify({
          enrollmentId: showModal.id,
          status: modalAction === 'approve' ? 'APPROVED' : 'REJECTED',
          responseMessage: responseText || undefined
        })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      toast.success(data.message)
      setShowModal(null)
      setModalAction(null)
      setResponseText('')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enrollment record?')) return
    try {
      const res = await fetch(`/api/admin/enrollments?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.token || ''}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Enrollment deleted')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (pageLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Enrollments</h1>
          <p className="text-gray-600 mt-1">Track and manage student enrollment requests</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex space-x-4">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by enrollment status"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {enrollments.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {statusFilter ? `No ${statusFilter.toLowerCase()} enrollments` : 'No Enrollments Yet'}
              </h3>
              <p className="text-gray-600">
                {statusFilter ? 'No enrollments match the current filter' : 'Enrollments will appear here once students request course access'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {enrollment.user.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">{enrollment.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{enrollment.course.title}</div>
                        <div className="text-xs text-gray-500">{enrollment.course.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(enrollment.status)}`}>
                          {enrollment.status}
                        </span>
                        {enrollment.requestMessage && (
                          <div className="mt-1 text-xs text-gray-400 italic truncate max-w-[150px]">
                            &ldquo;{enrollment.requestMessage}&rdquo;
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {enrollment.status === 'PENDING' ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => { setShowModal(enrollment); setModalAction('approve'); setResponseText('') }}
                              disabled={processingId === enrollment.id}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 disabled:bg-gray-400 transition"
                              aria-label={`Approve enrollment for ${enrollment.user.email}`}
                            >
                              {processingId === enrollment.id ? '...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => { setShowModal(enrollment); setModalAction('reject'); setResponseText('') }}
                              disabled={processingId === enrollment.id}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 disabled:bg-gray-400 transition"
                              aria-label={`Reject enrollment for ${enrollment.user.email}`}
                            >
                              {processingId === enrollment.id ? '...' : 'Reject'}
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            {enrollment.responseMessage && (
                              <span
                                className="text-xs text-gray-400 cursor-pointer hover:text-gray-600"
                                title={enrollment.responseMessage}
                              >
                                Response
                              </span>
                            )}
                            <button
                              onClick={() => handleDelete(enrollment.id)}
                              className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200 transition"
                              aria-label={`Delete enrollment record for ${enrollment.user.email}`}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {enrollments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-yellow-700">
                {enrollments.filter(e => e.status === 'PENDING').length}
              </p>
              <p className="text-sm text-yellow-600">Pending Requests</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-green-700">
                {enrollments.filter(e => e.status === 'APPROVED').length}
              </p>
              <p className="text-sm text-green-600">Approved Enrollments</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-red-700">
                {enrollments.filter(e => e.status === 'REJECTED').length}
              </p>
              <p className="text-sm text-red-600">Rejected Enrollments</p>
            </div>
          </div>
        )}
      </div>

      {/* Approval/Rejection Modal */}
      {showModal && modalAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {modalAction === 'approve' ? 'Approve Enrollment' : 'Reject Enrollment'}
              </h3>
              <button
                onClick={() => { setShowModal(null); setModalAction(null) }}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Student:</strong> {showModal.user.name || showModal.user.email}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Course:</strong> {showModal.course.title}
              </p>
              {showModal.requestMessage && (
                <div className="bg-gray-50 p-3 rounded-lg mt-2">
                  <p className="text-xs text-gray-500 mb-1">Student Message:</p>
                  <p className="text-sm text-gray-700">{showModal.requestMessage}</p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="responseMessage" className="block text-sm font-medium text-gray-700 mb-2">
                Response Message (optional)
              </label>
              <textarea
                id="responseMessage"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={modalAction === 'approve' ? 'Approved! Welcome to the course.' : 'Your request has been denied.'}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowModal(null); setModalAction(null) }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleProcess}
                disabled={processingId === showModal.id}
                className={`px-4 py-2 text-white rounded-lg transition disabled:bg-gray-400 ${
                  modalAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processingId === showModal.id ? 'Processing...' : `Yes, ${modalAction === 'approve' ? 'Approve' : 'Reject'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}