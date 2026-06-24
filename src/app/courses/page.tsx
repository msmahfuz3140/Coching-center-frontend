'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { courseAPI } from '@/lib/courseAPI'
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [selectedCategory])

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
              <Link
                key={course._id}
                href={`/courses/${course.slug}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 block"
              >
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                    {course.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                {course.instructor && (
                  <p className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">Instructor:</span> {course.instructor}
                  </p>
                )}
                {course.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                )}
                <div className="text-blue-600 font-medium hover:text-blue-700">
                  View Course →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}