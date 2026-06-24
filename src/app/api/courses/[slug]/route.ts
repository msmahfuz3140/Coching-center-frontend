import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/courses/[slug] - Get public course details
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth.api.getSession({ 
      headers: request.headers 
    })

    const course = await prisma.course.findUnique({
      where: { slug: params.slug },
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
          select: { enrollments: true }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // If not published, only allow admin or instructor to view
    if (!course.isPublished) {
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const userRole = (session.user as { role?: string })?.role
      const isInstructor = course.instructorId === session.user.id

      if (userRole !== 'ADMIN' && !isInstructor) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
  }
}