'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'DIPLOMA',
  'DUET_TECH',
  'DUET_NON_TECH',
  'SSC_9_10',
  'POLYTECHNIC_ADMISSION',
  'REFERRED_BATCH',
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
  instructor: {
    id: string
    name?: string
    email: string
  }
  isPublished: boolean
  _count?: {
    enrollments: number
    videos: number
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  DIPLOMA: 'Diploma',
  DUET_TECH: 'DUET Tech',
  DUET_NON_TECH: 'DUET Non-Tech',
  SSC_9_10: 'SSC 9-10',
  POLYTECHNIC_ADMISSION: 'Polytechnic Admission',
  REFERRED_BATCH: 'Referred batch',
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
    } catch (error) {
      setSession(null)
    }
  }

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const url = new URL('/api/courses', window.location.origin)
      if (selectedCategory) url.searchParams.append('category', selectedCategory)
      if (selectedSemester) url.searchParams.append('semester', String(selectedSemester))
      if (searchQuery) url.searchParams.append('search', searchQuery)

      const res = await fetch(url.toString())

      if (!res.ok) throw new Error('Failed to fetch courses')
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedSemester])

  useEffect(() => {
    loadSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])



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
        let errorMsg = `Error ${res.status}: Failed to send request`
        try {
          const errorData = await res.json()
          errorMsg = errorData.error || errorMsg
        } catch { }
        throw new Error(errorMsg)
      }

      toast.success('Enrollment request sent!')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send request')
    } finally {
      setProcessing(null)
    }
  }

  const getCategoryLabel = (category: string) => CATEGORY_LABELS[category] || category

  const filteredCourses = searchQuery
    ? courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    : courses

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Our Courses</h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
              Discover a wide range of courses designed to help you achieve your goals
            </p>
            <div className="mt-8 max-w-xl mx-auto relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-14 rounded-xl text-gray-900 bg-white/95 backdrop-blur-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        {/* Categories Filter */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-3 items-center">


            <button

              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${selectedCategory === null
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
            >
              All Courses
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat)
                  // Diploma category should show semesters; other categories hide semester filter
                  setSelectedSemester(cat === 'DIPLOMA' ? null : null)
                }}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${selectedCategory === cat
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                  }`}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}

            {/* Semester filter (Diploma only) */}
            {selectedCategory === 'DIPLOMA' && (
              <div className="w-full mt-4">
                <div className="flex flex-wrap gap-3">
                  {SEMESTERS.map((sem) => (
                    <button
                      key={sem}
                      onClick={() => setSelectedSemester(sem)}
                      className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 border ${selectedSemester === sem
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 border-transparent'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-100'
                        }`}
                    >
                      {sem} {sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th'} Semester
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>{filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
              <div className="mt-4 text-center text-gray-500 font-medium">Loading courses...</div>
            </div>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && filteredCourses.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-16 text-center">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No courses found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'Try a different search term' : 'No courses available in this category yet'}
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition">
                Clear Search
              </button>
            )}
          </div>
        )}

        {!loading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Card Header with Gradient */}
                <div className={`h-48 bg-gradient-to-br ${CATEGORY_COLORS[course.category] || 'from-blue-500 to-indigo-600'} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                    <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-lg">
                      {getCategoryLabel(course.category)}
                    </span>
                    {course._count && (
                      <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-lg flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {course._count.videos} videos
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white leading-tight line-clamp-2 drop-shadow-lg">
                      {course.title}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  {course.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    {course.instructor?.name && (
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {course.instructor.name}
                      </span>
                    )}
                    {course.semester && (
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Sem {course.semester}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="flex-1 text-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition text-sm"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        requestEnrollment(course.id)
                      }}
                      disabled={processing === course.id}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 transition-all shadow-lg shadow-blue-600/20 text-sm"
                    >
                      {processing === course.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        'Enroll Now'
                      )}
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