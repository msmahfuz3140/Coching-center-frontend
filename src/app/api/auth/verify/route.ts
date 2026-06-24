import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: 'Email and OTP are required.' }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const verification = await prisma.verification.findFirst({
      where: { identifier: normalizedEmail, value: String(otp) },
    })

    if (!verification) {
      return NextResponse.json({ success: false, message: 'Invalid verification code.' }, { status: 400 })
    }

    if (verification.expiresAt < new Date()) {
      return NextResponse.json({ success: false, message: 'Verification code has expired.' }, { status: 400 })
    }

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { emailVerified: true },
    })

    await prisma.verification.deleteMany({ where: { identifier: normalizedEmail } })

    return NextResponse.json({ success: true, message: 'Email verified successfully.' })
  } catch (error) {
    console.error('Verification error', error)
    return NextResponse.json({ success: false, message: 'Failed to verify email.' }, { status: 500 })
  }
}
