import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/notices - Get all notices
export async function GET() {
  try {
    const notices = await prisma.notice.findMany({
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        course: {
          select: { id: true, title: true, slug: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ success: true, notices })
  } catch (error) {
    console.error('Error fetching notices:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch notices' }, { status: 500 })
  }
}

// POST /api/admin/notices - Create a notice
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as { role?: string })?.role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, priority, courseId } = body

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Title and content are required' }, { status: 400 })
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        priority: priority || 'normal',
        authorId: session.user.id,
        courseId: courseId || null,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } }
      }
    })

    return NextResponse.json({ success: true, notice }, { status: 201 })
  } catch (error) {
    console.error('Error creating notice:', error)
    return NextResponse.json({ success: false, error: 'Failed to create notice' }, { status: 500 })
  }
}

// PATCH /api/admin/notices - Update a notice
export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as { role?: string })?.role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, title, content, priority, courseId } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Notice ID is required' }, { status: 400 })
    }

    const data: any = {}
    if (title) data.title = title
    if (content) data.content = content
    if (priority) data.priority = priority
    if (courseId !== undefined) data.courseId = courseId || null

    const notice = await prisma.notice.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } }
      }
    })

    return NextResponse.json({ success: true, notice })
  } catch (error) {
    console.error('Error updating notice:', error)
    return NextResponse.json({ success: false, error: 'Failed to update notice' }, { status: 500 })
  }
}

// DELETE /api/admin/notices?id=xxx - Delete a notice
export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as { role?: string })?.role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Notice ID is required' }, { status: 400 })
    }

    await prisma.notice.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Notice deleted' })
  } catch (error) {
    console.error('Error deleting notice:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete notice' }, { status: 500 })
  }
}