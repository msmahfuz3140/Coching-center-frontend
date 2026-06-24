'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import DashboardLayout from '@/components/layout/DashboardLayout'

type CourseCategory = 'DIPLOMA' | 'DUET_TECH' | 'DUET_NON_TECH' | 'SSC_9_10' | 'POLYTECHNIC_ADMISSION' | 'REFERRED_BATCH'

interface Topic {
  id: string
  title: string
  description?: string
  duration?: string
  orderIndex: number
}

interface Syllabus {
  id: string
  title: string
  description?: string
  orderIndex: number
  topics: Topic[]
}

interface Video {
  id: string
  title: string
  description?: string
  youtubeUrl: string
  duration?: number
  isFree: boolean
  orderIndex: number
}

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
  syllabus: Syllabus[]
  videos: Video[]
  _count: {
    enrollments: number
  }
}

export default function CourseDetailsPage() {
  const params = useParams()
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [course, setCourse] = useState<Course | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)

  const loadSession = async () => {
    try {
      const { data } = await authClient.getSession()
      if (data) {
        setSession(data)
      }
      await loadCourse()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${params.slug}`)
      if (res.ok) {
        const data = await res.json()
        setCourse(data)
      }
    } catch (error) {
      console.error('Error loading course:', error)
    }
  }

  const handleEnroll = async () => {
    if (!session) {
      window.location.href = '/login'
      return
    }

    setEnrolling(true)
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course?.id })
      })

      if (res.ok) {
        setIsEnrolled(true)
        alert('Successfully enrolled!')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to enroll')
      }
    } catch (error) {
      console.error('Error enrolling:', error)
      alert('Failed to enroll')
    } finally {
      setEnrolling(false)
    }
  }

  useEffect(() => { loadSession() }, [])

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

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
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

  if (!course) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600">The course you're looking for doesn't exist or has been removed.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          {course.thumbnail && (
            <div className="relative h-64 md:h-96">
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
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

                <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>

                {course.description && (
                  <p className="text-lg text-gray-600 mb-6">{course.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
                  {course.semester && (
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Semester {course.semester}
                    </span>
                  )}
                  {course.duration && (
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {course.duration}
                    </span>
                  )}
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {course._count.enrollments} students enrolled
                  </span>
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {course.videos.length} videos
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-bold text-blue-600">
                      {course.price === 0 ? 'Free' : `৳${course.price}`}
                    </span>
                  </div>
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling || isEnrolled}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enrolling ? 'Enrolling...' : isEnrolled ? 'Enrolled' : 'Enroll Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {course.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Syllabus */}
            {course.syllabus && course.syllabus.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Syllabus</h2>
                <div className="space-y-6">
                  {course.syllabus.map((syllabus, index) => (
                    <div key={syllabus.id} className="border-l-4 border-blue-500 pl-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {index + 1}. {syllabus.title}
                        </h3>
                        {syllabus.description && (
                          <p className="text-gray-600">{syllabus.description}</p>
                        )}
                      </div>

                      {syllabus.topics && syllabus.topics.length > 0 && (
                        <div className="space-y-3 ml-4">
                          {syllabus.topics.map((topic) => (
                            <div key={topic.id} className="flex items-start bg-gray-50 rounded-lg p-4">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-1">{topic.title}</h4>
                                {topic.description && (
                                  <p className="text-sm text-gray-600 mb-2">{topic.description}</p>
                                )}
                                {topic.duration && (
                                  <span className="text-xs text-gray-500 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {topic.duration}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {course.videos && course.videos.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Videos</h2>
                <div className="space-y-4">
                  {course.videos.map((video, index) => (
                    <div key={video.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-500">
                              Video {index + 1}
                            </span>
                            {video.isFree && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                Free
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">{video.title}</h3>
                          {video.description && (
                            <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatDuration(video.duration)}
                            </span>
                          </div>
                        </div>
                        <a
                          href={video.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Instructor</h3>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {course.instructor.name?.charAt(0) || course.instructor.email.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">
                    {course.instructor.name || 'Instructor'}
                  </p>
                  <p className="text-sm text-gray-500">{course.instructor.email}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Course Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-gray-600">Category: {getCategoryLabel(course.category)}</span>
                  </div>
                  {course.semester && (
                    <div className="flex items-center text-sm">
                      <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="text-gray-600">Semester: {course.semester}</span>
                    </div>
                  )}
                  {course.duration && (
                    <div className="flex items-center text-sm">
                      <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600">Duration: {course.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-600">{course.videos.length} videos</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-gray-600">{course._count.enrollments} students</span>
                  </div>
                </div>
              </div>

              {!isEnrolled && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}