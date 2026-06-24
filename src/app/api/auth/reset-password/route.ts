import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, otp, password } = await request.json()

    if (!email || !otp || !password) {
      return NextResponse.json({ success: false, message: 'Email, OTP, and password are required.' }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const verification = await prisma.verification.findFirst({
      where: { identifier: normalizedEmail, value: String(otp) },
    })

    if (!verification) {
      return NextResponse.json({ success: false, message: 'Invalid reset code.' }, { status: 400 })
    }

    if (verification.expiresAt < new Date()) {
      return NextResponse.json({ success: false, message: 'Reset code has expired.' }, { status: 400 })
    }

    const hashedPassword = bcrypt.hashSync(String(password), 10)
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 })
    }

    await prisma.account.updateMany({
      where: { userId: user.id, providerId: 'credential' },
      data: { password: hashedPassword },
    })
    await prisma.verification.deleteMany({ where: { identifier: normalizedEmail } })

    return NextResponse.json({ success: true, message: 'Password reset successfully.' })
  } catch (error) {
    console.error('Reset password error', error)
    return NextResponse.json({ success: false, message: 'Failed to reset password.' }, { status: 500 })
  }
}
