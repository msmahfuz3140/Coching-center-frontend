'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { id: 'DIPLOMA', label: 'Diploma' },
  { id: 'DUET_TECH', label: 'DUET Tech' },
  { id: 'DUET_NON_TECH', label: 'DUET Non-Tech' },
  { id: 'SSC_9_10', label: 'SSC 9-10' },
  { id: 'POLYTECHNIC_ADMISSION', label: 'Polytechnic Admission' },
  { id: 'REFERRED_BATCH', label: 'Referred Batch' },
]

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7]

interface Course {
  id: string
  title: string
  slug: string
  description?: string
  thumbnail?: string
  price: number
  category: string
  semester?: number
  duration?: string
  instructor: { id: string; name?: string; email: string }
  isPublished: boolean
  _count?: { enrollments: number; videos: number }
}

const CATEGORY_COLORS: Record<string, string> = {
  DIPLOMA: 'from-blue-500 to-blue-700',
  DUET_TECH: 'from-purple-500 to-purple-700',
  DUET_NON_TECH: 'from-pink-500 to-pink-700',
  SSC_9_10: 'from-green-500 to-green-700',
  POLYTECHNIC_ADMISSION: 'from-orange-500 to-orange-700',
  REFERRED_BATCH: 'from-yellow-500 to-yellow-700',
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [session, setSession] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const loadSession = async () => {
    try {
      const { data } = await authClient.getSession()
      setSession(data)
    } catch {
      setSession(null)
    }
  }

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory) params.set('category', selectedCategory)
      if (selectedSemester) params.set('semester', selectedSemester.toString())
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/courses?${params.toString()}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setCourses(data || [])
    } catch (error) {
      toast.error('Failed to load courses')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
    loadSession()
  }, [selectedCategory, selectedSemester])

  const requestEnrollment = async (courseId: string) => {
    if (processing) return
    try {
      if (!session?.user) {
        toast.error('Please login to request enrollment')
        return
      }
      setProcessing(courseId)
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseId }),
      })
      if (!res.ok) {
        let msg = `Error ${res.status}: Failed`
        try { msg = (await res.json()).error || msg } catch {}
        throw new Error(msg)
      }
      toast.success('Enrollment request sent!')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send request')
    } finally {
      setProcessing(null)
    }
  }

  const handleCategoryClick = (cat: string | null) => {
    setSelectedCategory(cat)
    if (cat !== 'DIPLOMA') setSelectedSemester(null)
  }

  const filteredCourses = searchQuery
    ? courses.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : courses

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-500 mt-1">Browse and enroll in courses</p>

          {/* Search */}
          <div className="mt-6 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category & Semester Filters */}
        <div className="mb-8 space-y-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                !selectedCategory ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Semester Filter (only for Diploma) */}
          {selectedCategory === 'DIPLOMA' && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">Semester:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedSemester(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    !selectedSemester ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  All
                </button>
                {SEMESTERS.map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setSelectedSemester(sem)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      selectedSemester === sem ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 border border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Sem {sem}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results count */}
          {!loading && (
            <p className="text-sm text-gray-500">
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!loading && filteredCourses.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try a different search term' : 'No courses available in this category'}
            </p>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all">
                {/* Banner */}
                <div className={`h-36 bg-gradient-to-br ${CATEGORY_COLORS[course.category] || 'from-blue-500 to-indigo-600'} p-5 flex flex-col justify-between`}>
                  <div className="flex items-start justify-between">
                    <span className="px-2.5 py-1 bg-white/20 text-white text-xs font-semibold rounded-md backdrop-blur-sm">
                      {CATEGORIES.find(c => c.id === course.category)?.label || course.category}
                    </span>
                    {course.semester && (
                      <span className="px-2.5 py-1 bg-white/20 text-white text-xs font-semibold rounded-md backdrop-blur-sm">
                        Sem {course.semester}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">{course.title}</h3>
                </div>

                {/* Body */}
                <div className="p-5">
                  {course.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    {course.instructor?.name && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        {course.instructor.name}
                      </span>
                    )}
                    {course._count && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        {course._count.videos} videos
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); requestEnrollment(course.id) }}
                      disabled={processing === course.id}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
                    >
                      {processing === course.id ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending...
                        </span>
                      ) : 'Enroll'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}