'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { authClient } from '@/lib/auth-client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ConfirmModal from '@/components/ui/ConfirmModal'

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
  instructor: { id: string; name?: string; email: string }
  _count: { enrollments: number; videos: number }
}

const CATEGORY_META: Record<CourseCategory, { label: string; color: string; emoji: string }> = {
  DIPLOMA: { label: 'Diploma', color: 'bg-blue-100 text-blue-700', emoji: '🎓' },
  DUET_TECH: { label: 'DUET Tech', color: 'bg-violet-100 text-violet-700', emoji: '⚙️' },
  DUET_NON_TECH: { label: 'DUET Non-Tech', color: 'bg-pink-100 text-pink-700', emoji: '📐' },
  SSC_9_10: { label: 'SSC 9-10', color: 'bg-emerald-100 text-emerald-700', emoji: '📗' },
  POLYTECHNIC_ADMISSION: { label: 'Polytechnic', color: 'bg-orange-100 text-orange-700', emoji: '🏫' },
  REFERRED_BATCH: { label: 'Referred Batch', color: 'bg-amber-100 text-amber-700', emoji: '🤝' },
}

const EMPTY_FORM = { title: '', slug: '', description: '', thumbnail: '', price: 0, category: 'DIPLOMA' as CourseCategory, semester: '', duration: '', requirements: '', isPublished: false }

const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'
const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5'

export default function AdminCoursesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('ALL')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'published' | 'draft'>('ALL')
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null })
  const router = useRouter()

  const loadCourses = async () => {
    const res = await fetch('/api/admin/courses')
    if (res.ok) setCourses(await res.json())
  }

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await authClient.getSession()
        if (!data) { router.push('/login'); return }
        if ((data.user as { role?: string })?.role !== 'ADMIN') { router.push('/dashboard'); return }
        await loadCourses()
      } catch (e) { console.error(e) }
      finally { setIsLoading(false) }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => courses.filter(c => {
    const s = search.toLowerCase()
    const matchSearch = !search || c.title.toLowerCase().includes(s) || c.slug.includes(s)
    const matchCat = filterCategory === 'ALL' || c.category === filterCategory
    const matchStatus = filterStatus === 'ALL' || (filterStatus === 'published' ? c.isPublished : !c.isPublished)
    return matchSearch && matchCat && matchStatus
  }), [courses, search, filterCategory, filterStatus])

  const stats = useMemo(() => ({
    total: courses.length,
    published: courses.filter(c => c.isPublished).length,
    draft: courses.filter(c => !c.isPublished).length,
    students: courses.reduce((a, c) => a + c._count.enrollments, 0),
  }), [courses])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const url = editingCourse ? `/api/admin/courses/${editingCourse.id}` : '/api/admin/courses'
      const body = { ...formData, semester: formData.semester ? parseInt(formData.semester) : null, requirements: formData.requirements.split('\n').filter(r => r.trim()) }
      const res = await fetch(url, { method: editingCourse ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { await loadCourses(); closeModal(); toast.success(editingCourse ? 'Course updated!' : 'Course created!') }
      else { const err = await res.json(); toast.error(err.error || 'Failed') }
    } catch { toast.error('Failed to save') }
    finally { setIsSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    setDeleteModal({ isOpen: true, id })
  }

  const confirmDelete = async () => {
    if (!deleteModal.id) return
    const res = await fetch(`/api/admin/courses/${deleteModal.id}`, { method: 'DELETE' })
    if (res.ok) { await loadCourses(); toast.success('Course deleted') }
    else toast.error('Failed to delete')
    setDeleteModal({ isOpen: false, id: null })
  }

  const openEdit = (course: Course) => {
    setEditingCourse(course)
    setFormData({ title: course.title, slug: course.slug, description: course.description || '', thumbnail: course.thumbnail || '', price: course.price, category: course.category, semester: course.semester?.toString() || '', duration: course.duration || '', requirements: course.requirements?.join('\n') || '', isPublished: course.isPublished })
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditingCourse(null); setFormData(EMPTY_FORM) }
  const set = (k: string, v: unknown) => setFormData(p => ({ ...p, [k]: v }))

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-indigo-600/20 border-t-indigo-600 animate-spin" />
          <p className="text-gray-500 font-medium">Loading courses…</p>
        </div>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Header banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #4f46e5 100%)' }}>
          <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-8 w-64 h-64 rounded-full bg-white/5" />
          <div className="relative px-8 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="text-indigo-300 text-sm font-medium">Admin Panel</p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">Manage Courses</h1>
              <p className="mt-1 text-indigo-200 text-sm">Create, edit and publish courses for your students</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: 'Total', value: stats.total },
                  { label: 'Published', value: stats.published },
                  { label: 'Draft', value: stats.draft },
                  { label: 'Students', value: stats.students },
                ].map(s => (
                  <div key={s.label} className="px-4 py-2 rounded-2xl bg-white/15 text-center min-w-[64px]">
                    <p className="text-xl font-black text-white">{s.value}</p>
                    <p className="text-xs text-indigo-300">{s.label}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex-shrink-0 flex items-center gap-2 bg-white text-indigo-700 font-bold px-5 py-2.5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                New Course
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search courses…" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="ALL">All Categories</option>
            {Object.entries(CATEGORY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <div className="flex gap-2">
            {(['ALL', 'published', 'draft'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${filterStatus === s ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s === 'ALL' ? 'All' : s === 'published' ? '✅ Published' : '📝 Draft'}
              </button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4">📚</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-400 text-sm mb-6">Create your first course to get started</p>
            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Create Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(course => {
              const meta = CATEGORY_META[course.category]
              return (
                <div key={course.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col">
                  {/* Thumbnail */}
                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-indigo-50 to-violet-50 flex-shrink-0">
                    {course.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">{meta.emoji}</div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${course.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {course.isPublished ? '✅ Live' : '📝 Draft'}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-900 text-base line-clamp-2 mb-1">{course.title}</h3>
                    {course.description && <p className="text-gray-400 text-xs line-clamp-2 mb-3">{course.description}</p>}

                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                      <span className="flex items-center gap-1">👥 {course._count.enrollments} students</span>
                      <span className="flex items-center gap-1">🎬 {course._count.videos} videos</span>
                      {course.duration && <span>⏱ {course.duration}</span>}
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-lg font-black text-indigo-600">{course.price === 0 ? 'Free' : `৳${course.price}`}</span>
                      <div className="flex gap-1.5">
                        <Link href={`/admin/courses/${course.id}/videos`} title="Videos" className="p-2 rounded-xl hover:bg-violet-50 text-gray-400 hover:text-violet-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </Link>
                        <Link href={`/courses/${course.slug}`} title="Preview" className="p-2 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </Link>
                        <button onClick={() => openEdit(course)} title="Edit" className="p-2 rounded-xl hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(course.id)} title="Delete" className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onMouseDown={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)' }}>
              <div>
                <h2 className="text-lg font-bold text-white">{editingCourse ? '✏️ Edit Course' : '✨ New Course'}</h2>
                <p className="text-indigo-300 text-sm mt-0.5">{editingCourse ? 'Update course details' : 'Fill in the details below'}</p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto">
              <div className="p-6 space-y-4">
                <div>
                  <label className={labelCls}>Course Title *</label>
                  <input type="text" required value={formData.title} onChange={e => { set('title', e.target.value); if (!editingCourse) set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) }} className={inputCls} placeholder="e.g., Diploma in Computer Science" />
                </div>

                <div>
                  <label className={labelCls}>Slug *</label>
                  <input type="text" required value={formData.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} className={inputCls} placeholder="e.g., diploma-cse-1st-semester" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Category *</label>
                    <select required value={formData.category} onChange={e => set('category', e.target.value)} className={inputCls}>
                      {Object.entries(CATEGORY_META).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Price (৳)</label>
                    <input type="number" min="0" value={formData.price} onChange={e => set('price', parseFloat(e.target.value) || 0)} className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Semester (Diploma)</label>
                    <input type="number" min="1" max="7" value={formData.semester} onChange={e => set('semester', e.target.value)} className={inputCls} placeholder="1-7" />
                  </div>
                  <div>
                    <label className={labelCls}>Duration</label>
                    <input type="text" value={formData.duration} onChange={e => set('duration', e.target.value)} className={inputCls} placeholder="e.g., 6 months" />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Description</label>
                  <textarea rows={3} value={formData.description} onChange={e => set('description', e.target.value)} className={inputCls} placeholder="Short course description…" />
                </div>

                <div>
                  <label className={labelCls}>Thumbnail URL</label>
                  <input type="url" value={formData.thumbnail} onChange={e => set('thumbnail', e.target.value)} className={inputCls} placeholder="https://example.com/image.jpg" />
                </div>

                <div>
                  <label className={labelCls}>Requirements (one per line)</label>
                  <textarea rows={3} value={formData.requirements} onChange={e => set('requirements', e.target.value)} className={inputCls} placeholder="Basic computer knowledge" />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => set('isPublished', !formData.isPublished)} className={`w-11 h-6 rounded-full transition-colors ${formData.isPublished ? 'bg-indigo-600' : 'bg-gray-200'} relative flex-shrink-0`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${formData.isPublished ? 'translate-x-5' : ''}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{formData.isPublished ? '✅ Published' : '📝 Draft'}</p>
                    <p className="text-xs text-gray-400">{formData.isPublished ? 'Students can see this course' : 'Not visible to students yet'}</p>
                  </div>
                </label>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex gap-3 flex-shrink-0">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition disabled:opacity-50">
                  {isSubmitting ? 'Saving…' : editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Course"
        message="This action cannot be undone. The course and all associated data will be permanently removed."
        confirmLabel="Delete"
        confirmColor="red"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null })}
      />
    </DashboardLayout>
  )
}
