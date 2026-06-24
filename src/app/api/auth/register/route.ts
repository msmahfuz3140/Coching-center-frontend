import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

function createOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required.' },
        { status: 400 }
      )
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    const otp = createOtp()
    const hashedPassword = bcrypt.hashSync(password, 10)

    if (existingUser) {
      if (existingUser.emailVerified) {
        return NextResponse.json(
          { success: false, message: 'An account with this email already exists.' },
          { status: 409 }
        )
      }

      await prisma.user.update({
        where: { id: existingUser.id },
        data: { name: String(name).trim() },
      })

      const existingAccount = await prisma.account.findFirst({ where: { userId: existingUser.id, providerId: 'credential' } })
      if (existingAccount) {
        await prisma.account.update({
          where: { id: existingAccount.id },
          data: { password: hashedPassword },
        })
      } else {
        await prisma.account.create({
          data: {
            accountId: `credential:${normalizedEmail}`,
            providerId: 'credential',
            userId: existingUser.id,
            password: hashedPassword,
          },
        })
      }

      await prisma.verification.deleteMany({ where: { identifier: normalizedEmail } })
      await prisma.verification.create({
        data: {
          identifier: normalizedEmail,
          value: otp,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      })

      return NextResponse.json({ success: true, message: 'Verification code sent to your email.', email: normalizedEmail, otp })
    }

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        role: 'STUDENT',
        emailVerified: false,
      },
    })

    await prisma.account.create({
      data: {
        accountId: `credential:${normalizedEmail}`,
        providerId: 'credential',
        userId: user.id,
        password: hashedPassword,
      },
    })

    await prisma.verification.deleteMany({ where: { identifier: normalizedEmail } })
    await prisma.verification.create({
      data: {
        identifier: normalizedEmail,
        value: otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    })

    return NextResponse.json({ success: true, message: 'Verification code sent to your email.', email: normalizedEmail, otp })
  } catch (error) {
    console.error('Registration error', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
