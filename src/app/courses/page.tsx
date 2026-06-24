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

export default function CoursesPage() {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const loadSession = async () => {
    try {
      const { data } = await authClient.getSession()
      if (data) {
        setSession(data)
      }
      await loadCourses()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      if (res.ok) {
        const data = await res.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Error loading courses:', error)
    }
  }

  useEffect(() => { loadSession() }, [])

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'ALL' || course.category === selectedCategory
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch && course.isPublished
  })

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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Our Courses</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover a wide range of courses designed to help you achieve your academic and professional goals
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as CourseCategory | 'ALL')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Categories</option>
                <option value="DIPLOMA">Diploma (1-7 Semester)</option>
                <option value="DUET_TECH">DUET Tech</option>
                <option value="DUET_NON_TECH">DUET Non-Tech</option>
                <option value="SSC_9_10">SSC 9-10</option>
                <option value="POLYTECHNIC_ADMISSION">Polytechnic Admission</option>
                <option value="REFERRED_BATCH">Referred Batch</option>
              </select>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory !== 'ALL' 
                ? 'Try adjusting your search or filter criteria' 
                : 'No courses are available at the moment'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{filteredCourses.length}</span> course{filteredCourses.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => router.push(`/courses/${course.slug}`)}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
                >
                  {course.thumbnail && (
                    <div className="relative h-48 overflow-hidden">
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(course.category)}`}>
                        {getCategoryLabel(course.category)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>

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
                      <span className="text-sm text-blue-600 font-medium flex items-center">
                        View Details
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}