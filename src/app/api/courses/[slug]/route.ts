import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/courses/[slug] - Get public course details
export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (session?.user && (session.user as any).isBlocked) {
      return NextResponse.json({ error: 'Your account has been blocked.' }, { status: 403 })
    }

    const course = await prisma.course.findUnique({
      where: { slug: params.slug },
      include: {
        instructor: {
          select: { id: true, name: true, email: true, phone: true }
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

    // Enrolled access control (course-locked content)
    // - Admin always has access
    // - Others: only APPROVED enrollment gets full video payload
    // - Not approved: keep course+syllabus metadata, but sanitize videos so youtubeUrl/content are not leaked

    const user = session?.user
    if (user && user.role !== 'ADMIN') {
      const approvedEnrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: course.id,
          },
        },
        select: { status: true },
      })

      const isApproved = approvedEnrollment?.status === 'APPROVED'
      if (!isApproved) {
        const sanitizedVideos = (course.videos || []).map((v) => ({
          ...v,
          youtubeUrl: '',
          description: null,
        }))

        return NextResponse.json({
          ...course,
          videos: sanitizedVideos,
        })
      }
    }

    // If no session/user: also sanitize videos
    if (!user) {
      const sanitizedVideos = (course.videos || []).map((v) => ({
        ...v,
        youtubeUrl: '',
        description: null,
      }))
      return NextResponse.json({
        ...course,
        videos: sanitizedVideos,
      })
    }


    return NextResponse.json(course)
  } catch (error) {

    console.error('Error fetching course:', error)
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
  }
}