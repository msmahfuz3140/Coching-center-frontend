export type Role = 'ADMIN' | 'STUDENT'
export type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  createdAt: Date
  updatedAt: Date
}

export interface AuthUser {
  userId: string
  email: string
  role: Role
}

export interface EnrollmentWithDetails {
  id: string
  enrolledAt: string
  completedAt: string | null
  progress: number
  status: EnrollmentStatus
  requestMessage: string | null
  responseMessage: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  userId: string
  user: {
    id: string
    name: string | null
    email: string
  }
  courseId: string
  course: {
    id: string
    title: string
    slug: string
    category: string
    thumbnail: string | null
  }
}
