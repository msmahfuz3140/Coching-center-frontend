import { prisma } from '@/lib/prisma'

export async function notifyEnrolledStudents(params: {
  courseId: string
  type: string
  title: string
  message: string
  excludeUserId?: string
}) {
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: params.courseId, status: 'APPROVED' },
    select: { userId: true },
  })

  const userIds = enrollments
    .map((e) => e.userId)
    .filter((id) => id !== params.excludeUserId)

  if (userIds.length === 0) return 0

  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      type: params.type,
      title: params.title,
      message: params.message,
      userId,
      courseId: params.courseId,
    })),
  })

  return userIds.length
}
