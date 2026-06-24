'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { courseAPI } from '@/lib/courseAPI'
import { authClient } from '@/lib/auth-client'
import toast from 'react-hot-toast'

interface Course {
  _id: string
  title: string
  slug: string
  description?: string
  category: string
  syllabus?: string
  youtubeVideoId?: string
  youtubePlaylistId?: string
  instructor?: string
  createdAt: string
}

export default function CourseDetailsPage() {
  const params = useParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    loadCourseAndSession()
  }, [params.slug])

  const loadCourseAndSession = async () => {
    try {
      setLoading(true)

      // Get session
      const { data: sessionData } = await authClient.getSession()
      setSession(sessionData)

      // Get course
      const courseData = await courseAPI.getCourseBySlug(params.slug as string)
      setCourse(courseData.course)
      setHasAccess(courseData.hasAccess || false)
    } catch (error) {
      toast.error('Failed to load course')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestAccess = async () => {
    if (!session) {
      toast.error('Please login to request access')
      return
    }

    if (hasAccess) {
      toast.success('You already have access to this course')
      return
    }

    try {
      setRequesting(true)
      const token = session.token || ''
      await courseAPI.requestCourseAccess(params.slug as string, token, 'I would like to access this course')
      toast.success('Enrollment request sent! Admin will review your request')
    } catch (error: any) {
      toast.error(error.message || 'Failed to request access')
    } finally {
      setRequesting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h1>
            <p className="text-gray-600">This course doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    )
  }

  const getEmbedUrl = (videoId: string) => {
    if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
      return videoId
    }
    return `https://www.youtube.com/embed/${videoId}`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-4">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 text-sm rounded-full font-semibold">
              {course.category}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>

          {course.instructor && (
            <p className="text-gray-600 mb-4">
              <span className="font-semibold">Instructor:</span> {course.instructor}
            </p>
          )}

          {course.description && (
            <p className="text-gray-700 mb-6 leading-relaxed">{course.description}</p>
          )}

          <div className="flex items-center gap-4">
            {hasAccess ? (
              <button
                disabled
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold cursor-default"
              >
                ✓ You have access
              </button>
            ) : (
              <button
                onClick={handleRequestAccess}
                disabled={requesting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {requesting ? 'Enrolling...' : 'Enroll Now'}
              </button>
            )}
          </div>
        </div>

        {/* YouTube Video */}
        {course.youtubeVideoId && hasAccess && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-video relative bg-gray-900">
              <iframe
                className="w-full h-full"
                src={getEmbedUrl(course.youtubeVideoId)}
                title={course.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {course.youtubeVideoId && !hasAccess && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Content Locked</h3>
            <p className="text-gray-600 mb-4">Request access to view course videos and materials</p>
          </div>
        )}

        {/* Syllabus */}
        {course.syllabus && hasAccess && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Syllabus</h2>
            <div className="prose prose-sm max-w-none text-gray-700">
              <p className="whitespace-pre-wrap">{course.syllabus}</p>
            </div>
          </div>
        )}

        {course.syllabus && !hasAccess && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Syllabus Preview</h3>
            <p className="text-gray-600">Syllabus is available after getting access</p>
          </div>
        )}

        {/* YouTube Playlist */}
        {course.youtubePlaylistId && hasAccess && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Video Playlist</h2>
            <div className="aspect-video relative bg-gray-900">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/videoseries?list=${course.youtubePlaylistId}`}
                title="Course Playlist"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">About this course</h3>
          <p className="text-blue-800 text-sm">
            {hasAccess
              ? 'You have full access to this course. Download materials and watch videos anytime.'
              : 'Request access to this course to view all content and materials.'}
          </p>
        </div>
      </div>
    </div>
  )
}
