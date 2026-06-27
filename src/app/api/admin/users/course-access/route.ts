import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Course access is represented via Enrollment status.
// If a user has Enrollment.status === 'APPROVED' for a course => they have access.

export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session?.user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const userRole = (session.user as { role?: string })?.role
        if (userRole !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
        }

        const url = new URL(request.url)
        const userId = url.searchParams.get('userId')
        if (!userId) {
            return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 })
        }

        const [courses, approvedEnrollments] = await Promise.all([
            prisma.course.findMany({
                orderBy: { createdAt: 'desc' },
                select: { id: true, title: true, slug: true, category: true },
            }),
            prisma.enrollment.findMany({
                where: {
                    userId,
                    status: 'APPROVED',
                },
                select: { courseId: true },
            }),
        ])

        const approvedCourseIds = new Set(approvedEnrollments.map((e) => e.courseId))

        return NextResponse.json({
            success: true,
            courses,
            approvedCourseIds: Array.from(approvedCourseIds),
        })
    } catch (error) {
        console.error('Get course access error', error)
        return NextResponse.json({ success: false, message: 'Failed to load course access.' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session?.user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const userRole = (session.user as { role?: string })?.role
        if (userRole !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
        }

        const { userId, courseIds } = await request.json()

        if (!userId) {
            return NextResponse.json({ success: false, message: 'userId is required.' }, { status: 400 })
        }

        if (!Array.isArray(courseIds)) {
            return NextResponse.json({ success: false, message: 'courseIds must be an array.' }, { status: 400 })
        }

        // Normalize: ensure unique and only non-empty strings
        const normalizedCourseIds = Array.from(new Set(courseIds.filter((id: any) => typeof id === 'string' && id.length > 0)))

        // Transaction plan:
        // 1) Delete APPROVED enrollments for courses not selected
        // 2) Upsert APPROVED enrollments for selected courses

        await prisma.$transaction(async (tx) => {
            const existingApproved = await tx.enrollment.findMany({
                where: { userId, status: 'APPROVED' },
                select: { courseId: true },
            })

            const existingApprovedIds = existingApproved.map((e) => e.courseId)
            const existingApprovedSet = new Set(existingApprovedIds)
            const selectedSet = new Set(normalizedCourseIds)

            const toRemove = existingApprovedIds.filter((cid) => !selectedSet.has(cid))
            if (toRemove.length > 0) {
                await tx.enrollment.deleteMany({
                    where: {
                        userId,
                        status: 'APPROVED',
                        courseId: { in: toRemove },
                    },
                })
            }

            // Upsert for selected
            for (const courseId of normalizedCourseIds) {
                // If any enrollment exists (pending/rejected), we'll set it to APPROVED.
                await tx.enrollment.upsert({
                    where: {
                        userId_courseId: { userId, courseId },
                    },
                    create: {
                        userId,
                        courseId,
                        status: 'APPROVED',
                    },
                    update: {
                        status: 'APPROVED',
                        progress: 0,
                        reviewedAt: new Date(),
                        reviewedBy: session.user?.id ? session.user.id : 'admin',
                        responseMessage: null,
                    },
                })

                // NOTE: We use upsert; the unique constraint is @@unique([userId, courseId])
            }

            // If no longer selected, nothing else to do.
        })

        return NextResponse.json({ success: true, message: 'Course access updated.' })
    } catch (error) {
        console.error('Update course access error', error)
        return NextResponse.json({ success: false, message: 'Failed to update course access.' }, { status: 500 })
    }
}

