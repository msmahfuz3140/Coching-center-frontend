import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const adminEmail = 'admin123@coaching.dev'
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } })

    if (existing) {
      return NextResponse.json({ success: true, message: 'Admin already exists.', email: adminEmail })
    }

    const hashedPassword = bcrypt.hashSync('admin12321', 10)
    const user = await prisma.user.create({
      data: {
        name: 'admin123',
        email: adminEmail,
        role: 'ADMIN',
        emailVerified: true,
      },
    })

    await prisma.account.create({
      data: {
        accountId: `credential:${adminEmail}`,
        providerId: 'credential',
        userId: user.id,
        password: hashedPassword,
      },
    })

    return NextResponse.json({ success: true, message: 'Admin account created.', email: adminEmail, password: 'admin12321' })
  } catch (error) {
    console.error('Seed admin error', error)
    return NextResponse.json({ success: false, message: 'Failed to seed admin.' }, { status: 500 })
  }
}
