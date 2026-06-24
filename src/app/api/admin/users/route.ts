import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,

      },
    })

    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error('Get users error', error)
    return NextResponse.json({ success: false, message: 'Failed to load users.' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, role, action } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 })
    }

    // action: 'BLOCK' | 'DELETE'
    if (action) {
      if (action === 'BLOCK') {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {},
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        })

        return NextResponse.json({ success: true, user: updatedUser })
      }

      if (action === 'DELETE') {
        await prisma.user.delete({ where: { id: userId } })
        return NextResponse.json({ success: true, deletedUserId: userId })
      }

      return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
    }

    if (!role) {
      return NextResponse.json({ success: false, message: 'Role is required.' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error('Update user error', error)
    return NextResponse.json({ success: false, message: 'Failed to update user.' }, { status: 500 })
  }
}


