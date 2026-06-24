import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/courses - List all courses
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ 
      headers: request.headers 
    })
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courses = await prisma.course.findMany({
      include: {
        instructor: {
          select: { id: true, name: true, email: true }
        },
        syllabus: {
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: { enrollments: true, videos: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

// POST /api/admin/courses - Create new course
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ 
      headers: request.headers 
    })
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as { role?: string })?.role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      slug,
      description,
      thumbnail,
      price,
      category,
      semester,
      duration,
      requirements,
      isPublished
    } = body

    // Validate required fields
    if (!title || !slug || !category) {
      return NextResponse.json(
        { error: 'Title, slug, and category are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingCourse = await prisma.course.findUnique({
      where: { slug }
    })

    if (existingCourse) {
      return NextResponse.json(
        { error: 'A course with this slug already exists' },
        { status: 400 }
      )
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        thumbnail,
        price: price || 0,
        category,
        semester,
        duration,
        requirements: requirements || [],
        isPublished: isPublished || false,
        instructorId: session.user.id
      },
      include: {
        instructor: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}