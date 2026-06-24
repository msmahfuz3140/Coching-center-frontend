'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { courseAPI } from '@/lib/courseAPI'
import { authClient } from '@/lib/auth-client'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'Diploma',
  'DUET Tech',
  'DUET Non-Tech',
  'SSC 9-10',
  'Polytechnic Admission',
  'Referred batch',
]

interface Course {
  _id: string
  title: string
  slug: string
  description?: string
  category: string
  instructor?: string
  youtubeVideoId?: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [session, setSession] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchCourses()
    loadSession()
  }, [selectedCategory])

  const loadSession = async () => {
    try {
      const { data } = await authClient.getSession()
      setSession(data)
    } catch (error) {
      setSession(null)
    }
  }

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const data = await courseAPI.getAllCourses(selectedCategory)
      setCourses(data.courses || [])
    } catch (error) {
      toast.error('Failed to load courses')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Courses</h1>
          <p className="text-gray-600">Browse and request access to courses</p>
        </div>

        {/* Categories Filter */}
        <div className="mb-8 pb-8 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium transition ${selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
            >
              All Courses
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition ${selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">No courses found</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                    {course.category}
                  </span>
                  <div className="text-sm text-gray-500">{course.instructor || 'Instructor TBA'}</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                {course.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <Link href={`/courses/${course.slug}`} className="text-blue-600 font-medium hover:text-blue-700">
                    View Course →
                  </Link>

                  <button
                    onClick={async (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (processing) return
                      try {
                        if (!session || !session.token) {
                          toast.error('Please login to request enrollment')
                          return
                        }
                        setProcessing(course._id)
                        await courseAPI.requestCourseAccess(course.slug, session.token, 'Requesting access from listing')
                        toast.success('Enrollment request sent')
                      } catch (err: any) {
                        toast.error(err?.message || 'Failed to send request')
                      } finally {
                        setProcessing(null)
                      }
                    }}
                    disabled={processing === course._id}
                    className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 transition"
                  >
                    {processing === course._id ? 'Sending...' : 'Enroll'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}