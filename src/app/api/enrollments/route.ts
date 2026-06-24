import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/enrollments - Request enrollment in a course
export async function POST(request: Request) {
  try {
    // Try to get session from cookie
    let session = await auth.api.getSession({ 
      headers: request.headers 
    })
    
    // If no session from cookie, try Bearer token
    if (!session?.user) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7)
        session = await auth.api.getSession({ 
          headers: new Headers({
            cookie: `better-auth.session_token=${token}`
          })
        })
      }
    }
    
    if (!session?.user) {
      console.error('Enrollment POST - No session found. Auth header:', request.headers.get('Authorization')?.slice(0,20), 'Cookie:', request.headers.get('cookie')?.slice(0,50))
      return NextResponse.json({ error: 'Unauthorized - Please login first' }, { status: 401 })
    }

    const body = await request.json()
    const { courseId, requestMessage } = body

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

    // Check if already has an enrollment (any status)
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId
        }
      }
    })

    if (existingEnrollment) {
      if (existingEnrollment.status === 'APPROVED') {
        return NextResponse.json({ error: 'You are already enrolled in this course' }, { status: 400 })
      }
      if (existingEnrollment.status === 'PENDING') {
        return NextResponse.json({ error: 'You already have a pending enrollment request for this course' }, { status: 400 })
      }
      if (existingEnrollment.status === 'REJECTED') {
        // Allow re-requesting if previously rejected - update the existing record
        const updated = await prisma.enrollment.update({
          where: { id: existingEnrollment.id },
          data: {
            status: 'PENDING',
            requestMessage: requestMessage || 'Re-requesting enrollment',
            responseMessage: null,
            reviewedBy: null,
            reviewedAt: null
          },
          include: {
            course: {
              select: { id: true, title: true, slug: true }
            }
          }
        })
        return NextResponse.json(updated, { status: 200 })
      }
    }

    // Create enrollment request
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId: courseId,
        status: 'PENDING',
        requestMessage: requestMessage || 'Requesting enrollment access',
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

    return NextResponse.json({ 
      message: 'Enrollment request submitted successfully. Waiting for admin approval.',
      enrollment 
    }, { status: 201 })
  } catch (error) {
    console.error('Error requesting enrollment:', error)
    return NextResponse.json({ error: 'Failed to request enrollment' }, { status: 500 })
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = { userId: session.user.id }
    if (status) {
      where.status = status
    }

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        course: {
          include: {
            instructor: {
              select: { id: true, name: true, email: true }
            },
            syllabus: {
              orderBy: { orderIndex: 'asc' },
              include: {
                topics: {
                  orderBy: { orderIndex: 'asc' }
                }
              }
            },
            videos: {
              orderBy: { orderIndex: 'asc' }
            },
            _count: {
              select: { enrollments: true, videos: true }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    })

    // Only show course content (videos, syllabus) for APPROVED enrollments
    const sanitized = enrollments.map(enrollment => {
      if (enrollment.status !== 'APPROVED') {
        const { course, ...rest } = enrollment
        return {
          ...rest,
          course: {
            ...course,
            videos: [],
            syllabus: []
          }
        }
      }
      return enrollment
    })

    return NextResponse.json(sanitized)
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 })
  }
}