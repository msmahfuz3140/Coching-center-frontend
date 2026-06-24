'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import DashboardLayout from '@/components/layout/DashboardLayout'

type CourseCategory = 'DIPLOMA' | 'DUET_TECH' | 'DUET_NON_TECH' | 'SSC_9_10' | 'POLYTECHNIC_ADMISSION' | 'REFERRED_BATCH'

interface Course {
  id: string
  title: string
  slug: string
  description?: string
  thumbnail?: string
  price: number
  isPublished: boolean
  category: CourseCategory
  semester?: number
  duration?: string
  requirements?: string[]
  createdAt: string
  instructor: {
    id: string
    name?: string
    email: string
  }
  _count: {
    enrollments: number
    videos: number
  }
}

export default function AdminCoursesPage() {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    thumbnail: '',
    price: 0,
    category: 'DIPLOMA' as CourseCategory,
    semester: '',
    duration: '',
    requirements: '',
    isPublished: false
  })
  const router = useRouter()

  const loadSession = async () => {
    try {
      const { data } = await authClient.getSession()
      if (!data) { router.push('/login'); return }
      if ((data.user as { role?: string } | undefined)?.role !== 'ADMIN') { router.push('/dashboard'); return }
      setSession(data)
      await loadCourses()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCourses = async () => {
    try {
      const res = await fetch('/api/admin/courses')
      if (res.ok) {
        const data = await res.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Error loading courses:', error)
    }
  }

  useEffect(() => { loadSession() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCourse ? `/api/admin/courses/${editingCourse.id}` : '/api/admin/courses'
      const method = editingCourse ? 'PATCH' : 'POST'

      const body = {
        ...formData,
        semester: formData.semester ? parseInt(formData.semester) : null,
        requirements: formData.requirements.split('\n').filter(r => r.trim())
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        await loadCourses()
        handleCloseModal()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to save course')
      }
    } catch (error) {
      console.error('Error saving course:', error)
      alert('Failed to save course')
    }
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      slug: course.slug,
      description: course.description || '',
      thumbnail: course.thumbnail || '',
      price: course.price,
      category: course.category,
      semester: course.semester?.toString() || '',
      duration: course.duration || '',
      requirements: course.requirements?.join('\n') || '',
      isPublished: course.isPublished
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return

    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        await loadCourses()
      } else {
        alert('Failed to delete course')
      }
    } catch (error) {
      console.error('Error deleting course:', error)
      alert('Failed to delete course')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCourse(null)
    setFormData({
      title: '',
      slug: '',
      description: '',
      thumbnail: '',
      price: 0,
      category: 'DIPLOMA',
      semester: '',
      duration: '',
      requirements: '',
      isPublished: false
    })
  }

  const getCategoryLabel = (category: CourseCategory) => {
    const labels: Record<CourseCategory, string> = {
      DIPLOMA: 'Diploma',
      DUET_TECH: 'DUET Tech',
      DUET_NON_TECH: 'DUET Non-Tech',
      SSC_9_10: 'SSC 9-10',
      POLYTECHNIC_ADMISSION: 'Polytechnic Admission',
      REFERRED_BATCH: 'Referred Batch'
    }
    return labels[category]
  }

  const getCategoryColor = (category: CourseCategory) => {
    const colors: Record<CourseCategory, string> = {
      DIPLOMA: 'bg-blue-100 text-blue-800',
      DUET_TECH: 'bg-purple-100 text-purple-800',
      DUET_NON_TECH: 'bg-pink-100 text-pink-800',
      SSC_9_10: 'bg-green-100 text-green-800',
      POLYTECHNIC_ADMISSION: 'bg-orange-100 text-orange-800',
      REFERRED_BATCH: 'bg-yellow-100 text-yellow-800'
    }
    return colors[category]
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Courses</h1>
            <p className="text-gray-600 mt-1">Create and manage your courses</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Course
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Yet</h3>
            <p className="text-gray-600 mb-6">Create your first course to get started</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                {course.thumbnail && (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(course.category)}`}>
                      {getCategoryLabel(course.category)}
                    </span>
                    {course.isPublished ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Draft
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                  
                  {course.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    {course.semester && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Semester {course.semester}
                      </span>
                    )}
                    {course.duration && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {course.duration}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {course._count.enrollments} students
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {course._count.videos} videos
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-lg font-bold text-blue-600">
                      {course.price === 0 ? 'Free' : `৳${course.price}`}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCourse ? 'Edit Course' : 'Create New Course'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Diploma in Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., diploma-cse-1st-semester"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as CourseCategory })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="DIPLOMA">Diploma (1-7 Semester)</option>
                    <option value="DUET_TECH">DUET Tech</option>
                    <option value="DUET_NON_TECH">DUET Non-Tech</option>
                    <option value="SSC_9_10">SSC 9-10</option>
                    <option value="POLYTECHNIC_ADMISSION">Polytechnic Admission</option>
                    <option value="REFERRED_BATCH">Referred Batch</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester (for Diploma)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1-7"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 6 months"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Course description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requirements (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Basic computer knowledge&#10;Mathematics background"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isPublished" className="ml-2 text-sm text-gray-700">
                    Publish course immediately
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                  >
                    {editingCourse ? 'Update Course' : 'Create Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}