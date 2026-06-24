import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Middleware to check admin role
async function checkAdmin(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return { error: 'Unauthorized', status: 401 }
  }
  const userRole = (session.user as { role?: string })?.role
  if (userRole !== 'ADMIN') {
    return { error: 'Forbidden: Admin access required', status: 403 }
  }
  return { session }
}

// GET /api/admin/enrollments - Get all enrollments (admin)
export async function GET(request: Request) {
  try {
    const result = await checkAdmin(request)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const courseId = searchParams.get('courseId')

    const where: any = {}
    if (status) {
      where.status = status
    }
    if (courseId) {
      where.courseId = courseId
    }

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true
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

// PATCH /api/admin/enrollments - Approve/Reject enrollment
export async function PATCH(request: Request) {
  try {
    const result = await checkAdmin(request)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    const body = await request.json()
    const { enrollmentId, status, responseMessage } = body

    if (!enrollmentId || !status) {
      return NextResponse.json({ error: 'Enrollment ID and status are required' }, { status: 400 })
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Status must be APPROVED or REJECTED' }, { status: 400 })
    }

    // Find the enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } }
      }
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    if (enrollment.status !== 'PENDING') {
      return NextResponse.json({ 
        error: `This enrollment is already ${enrollment.status.toLowerCase()}. Cannot change status.` 
      }, { status: 400 })
    }

    // Update the enrollment
    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status,
        responseMessage: responseMessage || null,
        reviewedBy: result.session.user.id,
        reviewedAt: new Date(),
        // If approved, set enrolledAt to now
        ...(status === 'APPROVED' ? { enrolledAt: new Date() } : {})
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, slug: true } }
      }
    })

    return NextResponse.json({ 
      message: `Enrollment ${status.toLowerCase()} successfully`,
      enrollment: updated 
    })
  } catch (error) {
    console.error('Error updating enrollment:', error)
    return NextResponse.json({ error: 'Failed to update enrollment' }, { status: 500 })
  }
}

// DELETE /api/admin/enrollments - Delete an enrollment
export async function DELETE(request: Request) {
  try {
    const result = await checkAdmin(request)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Enrollment ID is required' }, { status: 400 })
    }

    const enrollment = await prisma.enrollment.findUnique({ where: { id } })
    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    await prisma.enrollment.delete({ where: { id } })

    return NextResponse.json({ message: 'Enrollment deleted successfully' })
  } catch (error) {
    console.error('Error deleting enrollment:', error)
    return NextResponse.json({ error: 'Failed to delete enrollment' }, { status: 500 })
  }
}