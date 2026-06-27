import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/notices - Get notices for the current user
// Student can see: (1) notices for their enrolled courses, (2) general notices (no course)
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as { id: string; role?: string }

    // Find all courses the user is enrolled in (approved)
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: user.id,
        status: 'APPROVED',
      },
      select: {
        courseId: true,
      },
    })

    const enrolledCourseIds = enrollments.map((e) => e.courseId)

    // Build where clause dynamically to avoid MongoDB null filter issue
    const whereClause: any[] = [{ courseId: null }]
    if (enrolledCourseIds.length > 0) {
      whereClause.push({ courseId: { in: enrolledCourseIds } })
    }

    // Get notices: general (courseId is null) OR for enrolled courses
    const notices = await prisma.notice.findMany({
      where: {
        OR: whereClause,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, notices })
  } catch (error) {
    console.error('Error fetching student notices:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch notices' }, { status: 500 })
  }
}