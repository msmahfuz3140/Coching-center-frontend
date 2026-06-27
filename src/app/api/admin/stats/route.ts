import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/stats - Get real dashboard statistics
export async function GET() {
  try {
    const [totalUsers, totalCourses, totalEnrollments, approvedEnrollments, pendingEnrollments] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: 'APPROVED' } }),
      prisma.enrollment.count({ where: { status: 'PENDING' } }),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        approvedEnrollments,
        pendingEnrollments,
        rejectedEnrollments: totalEnrollments - approvedEnrollments - pendingEnrollments,
      },
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 })
  }
}