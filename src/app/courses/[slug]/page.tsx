'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import toast from 'react-hot-toast'
import VideoPlayer from '@/components/VideoPlayer'

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
  syllabus?: any[]
  videos?: Video[]
  _count?: { enrollments: number; videos: number }
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

const CATEGORIES = [
  { id: 'DIPLOMA', label: 'Diploma' },
  { id: 'DUET_TECH', label: 'DUET Tech' },
  { id: 'DUET_NON_TECH', label: 'DUET Non-Tech' },
  { id: 'SSC_9_10', label: 'SSC 9-10' },
  { id: 'POLYTECHNIC_ADMISSION', label: 'Polytechnic Admission' },
  { id: 'REFERRED_BATCH', label: 'Referred Batch' },
]

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

      if (sessionData?.user) {
        const user = sessionData.user as any
        // Admin always has access to all courses
        if (user.role === 'ADMIN') {
          setHasAccess(true)
        } else {
          const enrollRes = await fetch('/api/enrollments', { credentials: 'include' })
          if (enrollRes.ok) {
            const enrollments = await enrollRes.json()
            setHasAccess(enrollments.some((e: any) => e.courseId === courseData.id && e.status === 'APPROVED'))
          }
        }
      }

      if (courseData.videos?.length > 0) {
        setCurrentVideo(courseData.videos[0])
      }
    } catch (error) {
      toast.error('Failed to load course')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCourseAndSession() }, [params.slug])

  const handleRequestAccess = async () => {
    if (!session) { toast.error('Please login'); return }
    if (!course) return
    try {
      setRequesting(true)
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseId: course.id }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      toast.success('Enrollment request sent! Admin will review')
    } catch (error: any) {
      toast.error(error.message || 'Failed')
    } finally {
      setRequesting(false)
    }
  }

  const getLabel = (cat: string) => CATEGORIES.find(c => c.id === cat)?.label || cat

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-md">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Course not found</h1>
          <p className="text-gray-500 text-sm">This course doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const canWatch = (v: Video) => hasAccess || v.isFree

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md">{getLabel(course.category)}</span>
            {course.semester && <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-md">Semester {course.semester}</span>}
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{course.title}</h1>
              {course.description && <p className="text-gray-500 mt-1 max-w-2xl">{course.description}</p>}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
                {course.instructor?.name && <span>{course.instructor.name}</span>}
                {course._count && <span>{course._count.videos} videos</span>}
                {!hasAccess && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Locked — Enroll to watch
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRequestAccess}
                disabled={requesting || hasAccess}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition ${hasAccess
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400'
                  }`}
              >
                {requesting ? 'Enrolling...' : hasAccess ? 'Enrolled' : 'Enroll Now'}
              </button>
            </div>
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {currentVideo && (
              <VideoPlayer video={currentVideo} hasAccess={hasAccess} />
            )}

            {!currentVideo && (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">No videos available yet</p>
              </div>
            )}

            {course.syllabus && course.syllabus.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-4">Syllabus</h2>
                <div className="space-y-3">
                  {course.syllabus.map((item: any, i: number) => (
                    <div key={item.id || i} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <h3 className="font-medium text-gray-800 text-sm flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                        {item.title || `Module ${i + 1}`}
                      </h3>
                      {item.topics?.length > 0 && (
                        <ul className="ml-8 mt-2 space-y-1">
                          {item.topics.map((t: any, ti: number) => (
                            <li key={t.id || ti} className="text-sm text-gray-600 flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {t.title || t}
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

          {/* Sidebar */}
          <div className="space-y-6">
            {course.videos && course.videos.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <h2 className="font-semibold text-gray-900 text-sm">Videos ({course.videos.length})</h2>
                </div>
                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {course.videos.map((video, i) => (
                    <button key={video.id} onClick={() => setCurrentVideo(video)}
                      className={`w-full text-left p-3 hover:bg-gray-50 transition flex items-start gap-3 ${currentVideo?.id === video.id ? 'bg-blue-50' : ''}`}
                    >
                      <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-medium ${canWatch(video) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                        {canWatch(video) ? (
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-400">L{i + 1}</span>
                          {video.isFree && <span className="px-1 py-0.5 bg-green-100 text-green-700 text-[10px] rounded font-medium">Free</span>}
                        </div>
                        <p className="text-sm truncate">{video.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 text-sm mb-3">Course Info</h2>
              <div className="space-y-2 text-sm">
                {course.duration && <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="font-medium">{course.duration}</span></div>}
                {course.semester && <div className="flex justify-between"><span className="text-gray-500">Semester</span><span className="font-medium">{course.semester}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="font-medium">{getLabel(course.category)}</span></div>
                {course._count && <div className="flex justify-between"><span className="text-gray-500">Videos</span><span className="font-medium">{course._count.videos}</span></div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
