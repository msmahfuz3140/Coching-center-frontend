import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'

function createOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required.' }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    if (!user) {
      return NextResponse.json({ success: true, message: 'If that email exists, a reset code has been sent.' })
    }

    const otp = createOtp()
    await prisma.verification.deleteMany({ where: { identifier: normalizedEmail } })
    await prisma.verification.create({
      data: {
        identifier: normalizedEmail,
        value: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    })

    const emailSent = await sendVerificationEmail(normalizedEmail, otp, 'password-reset')
    if (!emailSent) {
      return NextResponse.json(
        { success: false, message: 'Failed to send reset email. Please try again.' },
        { status: 503 }
      )
    }

    return NextResponse.json({ success: true, message: 'If that email exists, a reset code has been sent.' })
  } catch (error) {
    console.error('Forgot password error', error)
    return NextResponse.json({ success: false, message: 'Failed to process password reset.' }, { status: 500 })
  }
}
