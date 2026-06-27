import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyEnrolledStudents } from '@/lib/notifyStudents'

// GET /api/admin/courses/[id] - Get single course
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const course = await prisma.course.findUnique({
      where: { id: params.id },
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

    return NextResponse.json(course)
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
  }
}

// PATCH /api/admin/courses/[id] - Update course
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
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

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id }
    })

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // If slug is being changed, check if new slug already exists
    if (slug && slug !== existingCourse.slug) {
      const slugExists = await prisma.course.findUnique({
        where: { slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'A course with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
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
      },
      include: {
        instructor: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    try {
      const changedFields: string[] = []
      if (title && title !== existingCourse.title) changedFields.push('title')
      if (description && description !== existingCourse.description) changedFields.push('description')
      if (thumbnail && thumbnail !== existingCourse.thumbnail) changedFields.push('thumbnail')
      if (isPublished !== undefined && isPublished !== existingCourse.isPublished) {
        changedFields.push(isPublished ? 'published' : 'unpublished')
      }
      if (price !== undefined && price !== existingCourse.price) changedFields.push('price')
      if (duration && duration !== existingCourse.duration) changedFields.push('duration')

      if (changedFields.length > 0) {
        await notifyEnrolledStudents({
          courseId: params.id,
          type: 'course_update',
          title: '📚 Course Updated',
          message: `"${course.title}" has been updated (${changedFields.slice(0, 3).join(', ')})`,
          excludeUserId: session.user.id,
        })
      }
    } catch (notifErr) {
      console.error('Course update notification error:', notifErr)
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
  }
}

// DELETE /api/admin/courses/[id] - Delete course
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
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

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id }
    })

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    await prisma.course.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}