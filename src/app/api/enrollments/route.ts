import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/enrollments - Enroll in a course
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ 
      headers: request.headers 
    })
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, isPublished: true, title: true }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (!course.isPublished) {
      return NextResponse.json({ error: 'This course is not available for enrollment' }, { status: 400 })
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json({ error: 'You are already enrolled in this course' }, { status: 400 })
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId: courseId,
        progress: 0
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    console.error('Error enrolling in course:', error)
    return NextResponse.json({ error: 'Failed to enroll in course' }, { status: 500 })
  }
}

// GET /api/enrollments - Get user's enrollments
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ 
      headers: request.headers 
    })
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            instructor: {
              select: { id: true, name: true, email: true }
            },
            syllabus: {
              orderBy: { orderIndex: 'asc' }
            },
            videos: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    })

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 })
  }
}