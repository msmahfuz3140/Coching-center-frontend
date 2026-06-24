'use client'

import { useState, useEffect } from 'react'
import { courseAPI } from '@/lib/courseAPI'
import { authClient } from '@/lib/auth-client'
import toast from 'react-hot-toast'

interface Course {
    _id: string
    title: string
    slug: string
    category: string
    instructor?: string
    youtubeVideoId?: string
}

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [session, setSession] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        category: 'Diploma',
        syllabus: '',
        youtubeVideoId: '',
        youtubePlaylistId: '',
        instructor: '',
    })

    useEffect(() => {
        loadSession()
    }, [])

    const loadSession = async () => {
        try {
            const { data } = await authClient.getSession()
            if (data?.user?.role === 'ADMIN') {
                setSession(data)
                // Get token from headers/cookies for API calls
                fetchCourses()
            } else {
                toast.error('Admin access required')
            }
        } catch (error) {
            toast.error('Not authorized')
        } finally {
            setLoading(false)
        }
    }

    const fetchCourses = async () => {
        try {
            const data = await courseAPI.getAllCourses()
            setCourses(data.courses || [])
        } catch (error) {
            toast.error('Failed to load courses')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!session?.token) {
            toast.error('No token found')
            return
        }

        try {
            if (editingId) {
                await courseAPI.updateCourse(editingId, formData, session.token || '')
                toast.success('Course updated')
            } else {
                await courseAPI.createCourse(formData, session.token || '')
                toast.success('Course created')
            }

            resetForm()
            fetchCourses()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return

        try {
            await courseAPI.deleteCourse(id, session.token || '')
            toast.success('Course deleted')
            fetchCourses()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const resetForm = () => {
        setFormData({
            title: '',
            slug: '',
            description: '',
            category: 'Diploma',
            syllabus: '',
            youtubeVideoId: '',
            youtubePlaylistId: '',
            instructor: '',
        })
        setEditingId(null)
        setShowForm(false)
    }

    const CATEGORIES = [
        'Diploma',
        'DUET Tech',
        'DUET Non-Tech',
        'SSC 9-10',
        'Polytechnic Admission',
        'Referred batch',
    ]

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
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Manage Courses</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                    >
                        {showForm ? 'Close' : '+ New Course'}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {editingId ? 'Edit Course' : 'Create New Course'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Course Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData({ ...formData, title: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Slug *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={(e) =>
                                            setFormData({ ...formData, slug: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) =>
                                            setFormData({ ...formData, category: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Instructor
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.instructor}
                                        onChange={(e) =>
                                            setFormData({ ...formData, instructor: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Syllabus
                                </label>
                                <textarea
                                    value={formData.syllabus}
                                    onChange={(e) =>
                                        setFormData({ ...formData, syllabus: e.target.value })
                                    }
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter course syllabus..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        YouTube Video ID
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.youtubeVideoId}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                youtubeVideoId: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., dQw4w9WgXcQ"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        YouTube Playlist ID
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.youtubePlaylistId}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                youtubePlaylistId: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                                >
                                    {editingId ? 'Update Course' : 'Create Course'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Courses Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Title
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Instructor
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Video
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course) => (
                                <tr key={course._id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">{course.title}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                            {course.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {course.instructor || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {course.youtubeVideoId ? (
                                            <span className="text-green-600 font-medium">✓</span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm space-x-3">
                                        <button
                                            onClick={() => {
                                                setEditingId(course._id)
                                                setShowForm(true)
                                                // TODO: Load course data into form
                                            }}
                                            className="text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course._id)}
                                            className="text-red-600 hover:text-red-700 font-medium"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {courses.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No courses yet. Create your first course!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
