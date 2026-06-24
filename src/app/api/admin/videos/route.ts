import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/videos?courseId=xxx - Get videos for a course
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
    }

    const videos = await prisma.video.findMany({
      where: { courseId },
      orderBy: { orderIndex: 'asc' }
    })

    return NextResponse.json(videos)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}

// POST /api/admin/videos - Create a video
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as { role?: string })?.role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, youtubeUrl, duration, orderIndex, isFree, courseId } = body

    if (!title || !youtubeUrl || !courseId) {
      return NextResponse.json({ error: 'Title, youtubeUrl, and courseId are required' }, { status: 400 })
    }

    // Convert YouTube URL to embed format
    const embedUrl = convertToEmbedUrl(youtubeUrl)

    const video = await prisma.video.create({
      data: {
        title,
        description,
        youtubeUrl: embedUrl,
        duration: duration ? parseInt(duration) : null,
        orderIndex: orderIndex || 0,
        isFree: isFree || false,
        courseId
      }
    })

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
  }
}

// PATCH /api/admin/videos - Update a video
export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as { role?: string })?.role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, title, description, youtubeUrl, duration, orderIndex, isFree } = body

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (youtubeUrl) updateData.youtubeUrl = convertToEmbedUrl(youtubeUrl)
    if (duration !== undefined) updateData.duration = parseInt(duration)
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex
    if (isFree !== undefined) updateData.isFree = isFree

    const video = await prisma.video.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(video)
  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 })
  }
}

// DELETE /api/admin/videos?id=xxx - Delete a video
export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as { role?: string })?.role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    await prisma.video.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
  }
}

// Helper: Convert YouTube URL to embed format
function convertToEmbedUrl(url: string): string {
  // Already an embed URL
  if (url.includes('youtube.com/embed/')) return url

  // youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`
  }

  // Just a video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return `https://www.youtube.com/embed/${url.trim()}`
  }

  return url
}