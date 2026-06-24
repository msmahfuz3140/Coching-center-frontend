'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import toast from 'react-hot-toast'

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
  syllabus?: any[]
  videos?: Video[]
  _count?: {
    enrollments: number
    videos: number
  }
}

interface Video {
  id: string
  title: string
  description: string | null
  youtubeUrl: string
  duration: number | null
  orderIndex: number
  isFree: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  DIPLOMA: 'Diploma',
  DUET_TECH: 'DUET Tech',
  DUET_NON_TECH: 'DUET Non-Tech',
  SSC_9_10: 'SSC 9-10',
  POLYTECHNIC_ADMISSION: 'Polytechnic Admission',
  REFERRED_BATCH: 'Referred batch',
}

export default function CourseDetailsPage() {
  const params = useParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)

  const loadCourseAndSession = async () => {
    try {
      setLoading(true)
      const { data: sessionData } = await authClient.getSession()
      setSession(sessionData)

      const res = await fetch(`/api/courses/${params.slug}`)
      if (!res.ok) throw new Error('Course not found')
      const courseData = await res.json()
      setCourse(courseData)
      
      // Check if user has access
      if (sessionData?.user) {
        const enrollRes = await fetch('/api/enrollments', { credentials: 'include' })
        if (enrollRes.ok) {
          const enrollments = await enrollRes.json()
          const hasApproved = enrollments.some(
            (e: any) => e.courseId === courseData.id && e.status === 'APPROVED'
          )
          setHasAccess(hasApproved)
        }
      }
      
      // Set first video as current
      if (courseData.videos && courseData.videos.length > 0) {
        setCurrentVideo(courseData.videos[0])
      }
    } catch (error) {
      toast.error('Failed to load course')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourseAndSession()
  }, [params.slug])

  const handleRequestAccess = async () => {
    if (!session) {
      toast.error('Please login to request access')
      return
    }
    if (!course) return

    try {
      setRequesting(true)
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseId: course.id }),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to send request')
      }
      
      toast.success('Enrollment request sent! Admin will review your request')
    } catch (error: any) {
      toast.error(error.message || 'Failed to request access')
    } finally {
      setRequesting(false)
    }
  }

  const getCategoryLabel = (category: string) => CATEGORY_LABELS[category] || category

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500 font-medium">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Course not found</h1>
          <p className="text-gray-500">This course doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const canWatchVideo = (video: Video) => hasAccess || video.isFree

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-lg">
                  {getCategoryLabel(course.category)}
                </span>
                {course.semester && (
                  <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-lg">
                    Semester {course.semester}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{course.title}</h1>
              {course.description && (
                <p className="text-blue-100 text-lg max-w-2xl">{course.description}</p>
              )}
              <div className="flex items-center gap-6 mt-4 text-blue-200">
                {course.instructor?.name && (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {course.instructor.name}
                  </span>
                )}
                {course._count && (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {course._count.videos} videos
                  </span>
                )}
              </div>
            </div>
            <div>
              {!hasAccess ? (
                <button
                  onClick={handleRequestAccess}
                  disabled={requesting}
                  className="px-8 py-3.5 bg-white text-blue-700 rounded-xl font-bold hover:bg-blue-50 disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-xl text-lg"
                >
                  {requesting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Enrolling...
                    </span>
                  ) : (
                    'Enroll Now — Free'
                  )}
                </button>
              ) : (
                <div className="px-8 py-3.5 bg-green-500 text-white rounded-xl font-bold shadow-xl text-lg flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Enrolled
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Video Player */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            {currentVideo && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="aspect-video bg-gray-900">
                  {canWatchVideo(currentVideo) ? (
                    <iframe
                      className="w-full h-full"
                      src={currentVideo.youtubeUrl}
                      title={currentVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white p-8">
                      <svg className="w-20 h-20 text-white/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <h3 className="text-xl font-bold mb-2">Content Locked</h3>
                      <p className="text-white/60 text-center">Enroll in this course to access this video</p>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900">{currentVideo.title}</h2>
                  {currentVideo.description && (
                    <p className="text-gray-600 mt-2">{currentVideo.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* No Video Selected */}
            {!currentVideo && course.videos && course.videos.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a video to start</h3>
                <p className="text-gray-500">Choose a video from the playlist on the right</p>
              </div>
            )}

            {(!course.videos || course.videos.length === 0) && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos yet</h3>
                <p className="text-gray-500">Course content is being prepared</p>
              </div>
            )}

            {/* Syllabus */}
            {course.syllabus && course.syllabus.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Course Syllabus
                </h2>
                <div className="space-y-4">
                  {course.syllabus.map((item: any, index: number) => (
                    <div key={item.id || index} className="border-b border-gray-100 pb-4 last:border-0">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        {item.title || `Module ${index + 1}`}
                      </h3>
                      {item.topics && item.topics.length > 0 && (
                        <ul className="ml-9 space-y-1.5">
                          {item.topics.map((topic: any, tIndex: number) => (
                            <li key={topic.id || tIndex} className="text-sm text-gray-600 flex items-center gap-2">
                              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {topic.title || topic}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Video Playlist */}
          <div className="space-y-6">
            {course.videos && course.videos.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Course Videos ({course.videos.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {course.videos.map((video, index) => (
                    <button
                      key={video.id}
                      onClick={() => setCurrentVideo(video)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        currentVideo?.id === video.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          canWatchVideo(video)
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {canWatchVideo(video) ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 font-medium">Lesson {index + 1}</span>
                            {video.isFree && (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">Free</span>
                            )}
                          </div>
                          <h3 className={`text-sm font-medium truncate ${
                            currentVideo?.id === video.id ? 'text-blue-700' : 'text-gray-900'
                          }`}>
                            {video.title}
                          </h3>
                          {video.duration && (
                            <span className="text-xs text-gray-400">{formatDuration(video.duration)}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Course Info Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Course Info
              </h2>
              <div className="space-y-3 text-sm">
                {course.duration && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium text-gray-900">{course.duration}</span>
                  </div>
                )}
                {course.semester && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Semester</span>
                    <span className="font-medium text-gray-900">{course.semester}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium text-gray-900">{getCategoryLabel(course.category)}</span>
                </div>
                {course._count && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Videos</span>
                    <span className="font-medium text-gray-900">{course._count.videos}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}