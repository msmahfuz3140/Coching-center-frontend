'use client'

import { useState, useEffect } from 'react'
import { courseAPI } from '@/lib/courseAPI'
import { authClient } from '@/lib/auth-client'
import toast from 'react-hot-toast'

interface CourseRequest {
    _id: string
    studentEmail: string
    courseId: {
        _id: string
        title: string
    }
    status: 'pending' | 'approved' | 'rejected'
    createdAt: string
    requestMessage?: string
}

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState<CourseRequest[]>([])
    const [session, setSession] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)

    useEffect(() => {
        loadSession()
    }, [])

    const loadSession = async () => {
        try {
            const { data } = await authClient.getSession()
            if (data?.user?.role === 'ADMIN') {
                setSession(data)
                fetchRequests()
            } else {
                toast.error('Admin access required')
            }
        } catch (error) {
            toast.error('Not authorized')
        } finally {
            setLoading(false)
        }
    }

    const fetchRequests = async () => {
        try {
            const data = await courseAPI.getPendingRequests(session.token || '')
            setRequests(data.requests || [])
        } catch (error) {
            toast.error('Failed to load requests')
        }
    }

    const handleApprove = async (requestId: string) => {
        try {
            // Ask admin for access pages (0 = full access)
            const pagesRaw = window.prompt('Enter number of pages to grant (0 = full access):', '0')
            if (pagesRaw === null) return // cancelled
            const accessPages = parseInt(pagesRaw || '0', 10) || 0

            // Optional expiry
            const expiresRaw = window.prompt('Optional expiry (YYYY-MM-DD) or leave empty:', '')
            const expiresAt = expiresRaw && expiresRaw.trim() !== '' ? expiresRaw.trim() : undefined

            setProcessingId(requestId)
            await courseAPI.approveCourseAccess(
                requestId,
                session.token || '',
                'Your access request has been approved!',
                accessPages,
                expiresAt
            )
            toast.success('Access approved')
            fetchRequests()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (requestId: string) => {
        try {
            setProcessingId(requestId)
            await courseAPI.rejectCourseAccess(
                requestId,
                session.token || '',
                'Your access request has been denied. Please contact admin.'
            )
            toast.success('Access rejected')
            fetchRequests()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setProcessingId(null)
        }
    }

    const pendingRequests = requests.filter((r) => r.status === 'pending')

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Access Requests</h1>
                    <p className="text-gray-600 mt-2">
                        {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {pendingRequests.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <svg
                            className="w-16 h-16 text-gray-300 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No Pending Requests
                        </h3>
                        <p className="text-gray-600">All access requests have been processed.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingRequests.map((request) => (
                            <div
                                key={request._id}
                                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Student Email:</p>
                                        <p className="font-semibold text-gray-900">{request.studentEmail}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                                        Pending
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-1">Course:</p>
                                    <p className="font-semibold text-gray-900">
                                        {request.courseId?.title || 'Course Deleted'}
                                    </p>
                                </div>

                                {request.requestMessage && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded">
                                        <p className="text-sm text-gray-600 mb-1">Message:</p>
                                        <p className="text-gray-700">{request.requestMessage}</p>
                                    </div>
                                )}

                                <div className="text-xs text-gray-500 mb-4">
                                    Requested on {new Date(request.createdAt).toLocaleDateString()}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleApprove(request._id)}
                                        disabled={processingId === request._id}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 transition"
                                    >
                                        {processingId === request._id ? 'Processing...' : 'Approve'}
                                    </button>
                                    <button
                                        onClick={() => handleReject(request._id)}
                                        disabled={processingId === request._id}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 transition"
                                    >
                                        {processingId === request._id ? 'Processing...' : 'Reject'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Approved/Rejected */}
                {requests.filter((r) => r.status !== 'pending').length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Processed Requests</h2>
                        <div className="space-y-3">
                            {requests
                                .filter((r) => r.status !== 'pending')
                                .map((request) => (
                                    <div
                                        key={request._id}
                                        className={`p-4 rounded-lg ${request.status === 'approved'
                                            ? 'bg-green-50 border border-green-200'
                                            : 'bg-red-50 border border-red-200'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {request.studentEmail}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {request.courseId?.title}
                                                </p>
                                            </div>
                                            <span
                                                className={`px-3 py-1 text-xs font-semibold rounded-full ${request.status === 'approved'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {request.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
