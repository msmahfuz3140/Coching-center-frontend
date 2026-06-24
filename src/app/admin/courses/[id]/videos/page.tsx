'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import toast from 'react-hot-toast'

interface Video {
  id: string
  title: string
  description: string | null
  youtubeUrl: string
  duration: number | null
  orderIndex: number
  isFree: boolean
  createdAt: string
}

export default function CourseVideosPage() {
  const params = useParams()
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [courseName, setCourseName] = useState('')
  const [videos, setVideos] = useState<Video[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    duration: '',
    orderIndex: '',
    isFree: false,
  })

  useEffect(() => { loadSession() }, [])

  const loadSession = async () => {
    try {
      const { data } = await authClient.getSession()
      if (!data) { router.push('/login'); return }
      if ((data.user as any)?.role !== 'ADMIN') { router.push('/dashboard'); return }
      setSession(data)
      await loadCourseName()
      await loadVideos()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCourseName = async () => {
    try {
      const res = await fetch(`/api/admin/courses/${params.id}`)
      if (res.ok) {
        const course = await res.json()
        setCourseName(course.title || '')
      }
    } catch {}
  }

  const loadVideos = async () => {
    try {
      const res = await fetch(`/api/admin/videos?courseId=${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setVideos(data)
      }
    } catch (error) {
      console.error('Error loading videos:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingVideo ? '/api/admin/videos' : '/api/admin/videos'
      const method = editingVideo ? 'PATCH' : 'POST'
      const body: any = {
        ...formData,
        courseId: params.id,
        duration: formData.duration || undefined,
        orderIndex: formData.orderIndex ? parseInt(formData.orderIndex) : videos.length,
      }
      if (editingVideo) body.id = editingVideo.id

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success(editingVideo ? 'Video updated!' : 'Video added!')
        resetForm()
        await loadVideos()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to save video')
      }
    } catch {
      toast.error('Failed to save video')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video?')) return
    try {
      const res = await fetch(`/api/admin/videos?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Video deleted')
        await loadVideos()
      }
    } catch {
      toast.error('Failed to delete video')
    }
  }

  const resetForm = () => {
    setFormData({ title: '', description: '', youtubeUrl: '', duration: '', orderIndex: '', isFree: false })
    setEditingVideo(null)
    setShowAddForm(false)
  }

  const getYoutubeThumbnail = (url: string) => {
    const match = url.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)
    if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
    return null
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => router.push('/admin/courses')} className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Courses
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Course Videos</h1>
            <p className="text-gray-600 mt-1">{courseName || 'Loading...'}</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {showAddForm ? 'Cancel' : 'Add Video'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingVideo ? 'Edit Video' : 'Add New Video'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video Title *</label>
                  <input type="text" required value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., Introduction to Algebra" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL *</label>
                  <input type="text" required value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="https://youtube.com/watch?v=... or video ID" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)</label>
                  <input type="number" value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., 3600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Index</label>
                  <input type="number" value={formData.orderIndex}
                    onChange={(e) => setFormData({ ...formData, orderIndex: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Auto" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={2} value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Optional description..." />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isFree}
                  onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm text-gray-700">Free preview (anyone can watch without enrollment)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg">
                  {editingVideo ? 'Update Video' : 'Add Video'}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Videos List */}
        {videos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Videos Yet</h3>
            <p className="text-gray-600 mb-6">Add YouTube videos to this course</p>
            <button onClick={() => setShowAddForm(true)} className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add First Video
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video, index) => (
              <div key={video.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                {/* Thumbnail */}
                <div className="relative bg-gray-900 aspect-video">
                  {getYoutubeThumbnail(video.youtubeUrl) ? (
                    <img src={getYoutubeThumbnail(video.youtubeUrl)!} alt={video.title} className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg opacity-90 hover:opacity-100 transition-opacity cursor-pointer">
                      <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    {video.isFree && <span className="px-2 py-1 bg-green-500 text-white text-xs rounded font-medium">Free</span>}
                    {video.duration && (
                      <span className="px-2 py-1 bg-black/60 text-white text-xs rounded">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-1">Video {video.orderIndex + 1}</div>
                      <h3 className="font-semibold text-gray-900 truncate">{video.title}</h3>
                      {video.description && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{video.description}</p>}
                    </div>
                    <div className="flex gap-2 ml-3">
                      <button onClick={() => {
                        setEditingVideo(video)
                        setFormData({
                          title: video.title,
                          description: video.description || '',
                          youtubeUrl: video.youtubeUrl,
                          duration: video.duration?.toString() || '',
                          orderIndex: video.orderIndex.toString(),
                          isFree: video.isFree,
                        })
                        setShowAddForm(true)
                      }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(video.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}