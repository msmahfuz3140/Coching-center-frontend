'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import toast from 'react-hot-toast'
import {
  Search, Grid, GraduationCap, Code, Layout, BookOpen,
  School, Users, Video, ChevronDown, Sparkles, Filter, X
} from 'lucide-react'

// Categories with icons
const CATEGORIES = [
  { id: 'DIPLOMA', label: 'Diploma', icon: GraduationCap },
  { id: 'DUET_TECH', label: 'DUET Tech', icon: Code },
  { id: 'DUET_NON_TECH', label: 'DUET Non-Tech', icon: Layout },
  { id: 'SSC_9_10', label: 'SSC 9-10', icon: BookOpen },
  { id: 'POLYTECHNIC_ADMISSION', label: 'Polytechnic', icon: School },
  { id: 'REFERRED_BATCH', label: 'Referred Batch', icon: Users },
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

// Category color schemes - matching PDF design
const CATEGORY_STYLES: Record<string, { gradient: string; badge: string; accent: string; icon: string }> = {
  DIPLOMA: {
    gradient: 'from-blue-600 to-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    accent: 'text-blue-600',
    icon: '🎓'
  },
  DUET_TECH: {
    gradient: 'from-violet-600 to-violet-700',
    badge: 'bg-violet-100 text-violet-700',
    accent: 'text-violet-600',
    icon: '</>'
  },
  DUET_NON_TECH: {
    gradient: 'from-rose-600 to-rose-700',
    badge: 'bg-rose-100 text-rose-700',
    accent: 'text-rose-600',
    icon: '💻'
  },
  SSC_9_10: {
    gradient: 'from-emerald-600 to-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    accent: 'text-emerald-600',
    icon: '📖'
  },
  POLYTECHNIC_ADMISSION: {
    gradient: 'from-amber-600 to-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    accent: 'text-amber-600',
    icon: '🏛️'
  },
  REFERRED_BATCH: {
    gradient: 'from-cyan-600 to-cyan-700',
    badge: 'bg-cyan-100 text-cyan-700',
    accent: 'text-cyan-600',
    icon: '👥'
  },
}

const CATEGORY_META_COLORS: Record<string, string> = {
  DIPLOMA: 'bg-blue-50 text-blue-600',
  DUET_TECH: 'bg-violet-50 text-violet-600',
  DUET_NON_TECH: 'bg-rose-50 text-rose-600',
  SSC_9_10: 'bg-emerald-50 text-emerald-600',
  POLYTECHNIC_ADMISSION: 'bg-amber-50 text-amber-600',
  REFERRED_BATCH: 'bg-cyan-50 text-cyan-600',
}

const BUTTON_COLORS: Record<string, string> = {
  DIPLOMA: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
  DUET_TECH: 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800',
  DUET_NON_TECH: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800',
  SSC_9_10: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800',
  POLYTECHNIC_ADMISSION: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800',
  REFERRED_BATCH: 'bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800',
}

// Generate initials from name
const getInitials = (name?: string): string => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// Get avatar background based on category
const AVATAR_BG: Record<string, string> = {
  DIPLOMA: 'bg-blue-600',
  DUET_TECH: 'bg-violet-600',
  DUET_NON_TECH: 'bg-rose-600',
  SSC_9_10: 'bg-emerald-600',
  POLYTECHNIC_ADMISSION: 'bg-amber-600',
  REFERRED_BATCH: 'bg-cyan-600',
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [session, setSession] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

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

  // Fetch session on mount only
  useEffect(() => {
    const loadSessionData = async () => {
      try {
        const { data } = await authClient.getSession()
        setSession(data)
      } catch {
        setSession(null)
      }
    }
    loadSessionData()
  }, [])

  // Fetch courses when filters change
  useEffect(() => {
    const controller = new AbortController()

    const loadData = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (selectedCategory) params.set('category', selectedCategory)
        if (selectedSemester) params.set('semester', selectedSemester.toString())
        if (searchQuery) params.set('search', searchQuery)

        const res = await fetch(`/api/courses?${params.toString()}`, { signal: controller.signal })
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        setCourses(data || [])
      } catch (error: any) {
        if (error?.name !== 'AbortError') {
          toast.error('Failed to load courses')
          console.error(error)
        }
      } finally {
        setLoading(false)
      }
    }
    loadData()

    return () => controller.abort()
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
        try {
          msg = (await res.json()).error || msg
        } catch { }
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

  // Live search filter
  const filteredCourses = searchQuery
    ? courses.filter(
      c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : courses

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HERO SECTION ===== */}
      <section
        className="relative overflow-hidden rounded-b-[40px] text-white"
        style={{
          background:
            "radial-gradient(circle at top left, #1e40af 0%, #132d7c 35%, #0b1437 100%)",
        }}
      >
        {/* Background Grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-cyan-400/20 blur-[120px]" />
        <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-purple-500/20 blur-[140px]" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-5 pt-20 pb-36 sm:px-8 lg:px-10">
          {/* Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 backdrop-blur-xl shadow-xl">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">
                Courses
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="mx-auto mt-8 max-w-4xl text-center">
            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-7xl">
              Unlock Your Potential.
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(to right,#93C5FD,#C4B5FD,#E9D5FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Find Your Course.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Explore our premium collection of expertly designed courses and
              accelerate your learning journey with industry-leading instructors.
            </p>
          </div>

          {/* Floating Search */}
          <div className="absolute bottom-0 left-1/2 w-full max-w-3xl -translate-x-1/2 translate-y-1/2 px-5">
            <div className="group relative">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-30 blur-2xl transition duration-500 group-hover:opacity-50" />

              <div className="relative flex items-center rounded-3xl border border-white/20 bg-white p-2 shadow-2xl">
                <Search className="ml-5 h-6 w-6 text-slate-400" />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses..."
                  className="h-16 w-full bg-transparent px-5 text-base text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-20 pb-16">

        {/* ===== FILTERS SECTION ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 mb-8">
          {/* Mobile Filter Toggle */}
          <div className="flex items-center justify-between md:hidden mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Filters</h2>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg"
            >
              <Filter className="w-4 h-4" />
              {showMobileFilters ? 'Hide' : 'Show'}
            </button>
          </div>

          {/* Categories */}
          <div className={showMobileFilters ? 'block' : 'hidden md:block'}>
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Categories</h2>
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2.5">
                {/* All Button */}
                <button
                  onClick={() => handleCategoryClick(null)}
                  className={`group flex flex-col items-center justify-center p-3.5 rounded-xl border-2 text-center transition-all duration-200 ${!selectedCategory
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-1.5 transition-colors ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                    }`}>
                    <Grid className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold">All</span>
                </button>

                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon
                  const isActive = selectedCategory === cat.id
                  const style = CATEGORY_STYLES[cat.id]
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`group flex flex-col items-center justify-center p-3.5 rounded-xl border-2 text-center transition-all duration-200 ${isActive
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm'
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-1.5 text-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                        }`}>
                        <Icon className="w-4 h-4" strokeWidth={2.5} />
                      </div>
                      <span className="text-[11px] font-semibold leading-tight">{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Semester Filter */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Semester</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSemester(null)}
                  disabled={selectedCategory !== 'DIPLOMA'}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${!selectedSemester && selectedCategory === 'DIPLOMA'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : selectedCategory === 'DIPLOMA'
                      ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                      : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  All
                </button>
                {SEMESTERS.map((sem) => {
                  const isActive = selectedSemester === sem
                  return (
                    <button
                      key={sem}
                      onClick={() => setSelectedSemester(sem)}
                      disabled={selectedCategory !== 'DIPLOMA'}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${isActive
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : selectedCategory === 'DIPLOMA'
                          ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                          : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      Sem {sem}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ===== RESULTS HEADER ===== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-semibold w-fit">
            <Grid className="w-3.5 h-3.5" />
            <span>{!loading ? `${filteredCourses.length} Courses Found` : 'Loading...'}</span>
          </div>
          <div className="relative">
            <select
              aria-label="Sort courses"
              className="appearance-none bg-white border border-gray-200 text-xs font-medium pl-3 pr-8 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 cursor-pointer hover:border-gray-300 transition-colors">
              <option>Latest First</option>
              <option>Most Popular</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* ===== LOADING STATE ===== */}
        {loading && (
          <div className="flex justify-center items-center py-32">
            <div className="relative">
              <div className="w-14 h-14 border-4 border-blue-100 rounded-full" />
              <div className="w-14 h-14 border-4 border-transparent border-t-blue-600 rounded-full animate-spin absolute inset-0" />
            </div>
          </div>
        )}

        {/* ===== EMPTY STATE ===== */}
        {!loading && filteredCourses.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No Courses Found</h3>
            <p className="text-sm text-gray-500">
              {searchQuery
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'No courses available in this segment yet.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* ===== COURSES GRID ===== */}
        {!loading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredCourses.map((course) => {
              const currentCategory = CATEGORIES.find(c => c.id === course.category)
              const categoryId = course.category || 'DIPLOMA'
              const style = CATEGORY_STYLES[categoryId]
              const metaColor = CATEGORY_META_COLORS[categoryId] || 'bg-blue-50 text-blue-600'
              const btnStyle = BUTTON_COLORS[categoryId] || 'bg-blue-600 hover:bg-blue-700'
              const avatarBg = AVATAR_BG[categoryId] || 'bg-blue-600'

              return (
                <div
                  key={course.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Card Header */}
                  <div className={`bg-gradient-to-br ${style.gradient} p-5 sm:p-6 relative`}>
                    {/* Category & Semester Badges */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-3 py-1 rounded-md border border-white/10">
                        {currentCategory?.label || course.category}
                      </span>
                      {course.semester && (
                        <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-3 py-1 rounded-md border border-white/10">
                          Sem {course.semester}
                        </span>
                      )}
                    </div>

                    {/* Instructor Avatar with Initials */}
                    <div className="flex items-center justify-center my-2">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-lg">
                        <span className="text-white text-2xl sm:text-3xl font-bold">
                          {getInitials(course.instructor?.name)}
                        </span>
                      </div>
                    </div>

                    {/* Spacer for bottom */}
                    <div className="h-3" />
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col">
                    {/* Course Title */}
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>

                    {/* Instructor Name */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className={`w-7 h-7 rounded-full ${avatarBg} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-[10px] font-bold">
                          {getInitials(course.instructor?.name)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          {course.instructor?.name || 'Instructor'}
                        </p>
                        <p className="text-[11px] text-gray-400">Instructor</p>
                      </div>
                    </div>

                    {/* Description */}
                    {course.description && (
                      <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <div className={`flex items-center gap-1.5 ${metaColor} p-2.5 rounded-lg`}>
                        <Video className="w-4 h-4" />
                        <span className="text-[11px] font-semibold">
                          {course._count?.videos || 0} Videos
                        </span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${metaColor} p-2.5 rounded-lg`}>
                        <Users className="w-4 h-4" />
                        <span className="text-[11px] font-semibold">
                          {course._count?.enrollments || 0} Students
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-gray-100">
                      <Link
                        href={`/courses/${course.slug}`}
                        className="border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 text-xs font-bold py-3 rounded-xl transition-all text-center"
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
                        className={`${btnStyle} text-white text-xs font-bold py-3 rounded-xl shadow-sm transition-all disabled:bg-gray-400 disabled:cursor-not-allowed`}
                      >
                        {processing === course.id ? (
                          <span className="flex items-center justify-center gap-1.5">
                            <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            ...
                          </span>
                        ) : (
                          'Enroll Now'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ===== BOTTOM PAGINATION PLACEHOLDER ===== */}
        {!loading && filteredCourses.length > 0 && (
          <div className="mt-10 text-center">
            <p className="text-xs text-gray-400 font-medium">
              Showing {filteredCourses.length} of {courses.length} courses
            </p>
          </div>
        )}
      </div>

    </div>
  )
}
