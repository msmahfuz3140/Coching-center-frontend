import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/courses - Get all published courses (public)
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ 
      headers: request.headers 
    })

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    // Build filter
    const where: any = {
      isPublished: true // Only show published courses to public
    }

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const courses = await prisma.course.findMany({
      where,
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