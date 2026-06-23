export type Role = 'ADMIN' | 'STUDENT'

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
