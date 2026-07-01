import { NextResponse } from 'next/server'
import { hashPassword } from '@better-auth/utils/password'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'

function createOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    const { name, email, password, username } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required.' },
        { status: 400 }
      )
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    
    let normalizedUsername = null
    if (username) {
      normalizedUsername = String(username).trim().toLowerCase()
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(normalizedUsername)) {
        return NextResponse.json(
          { success: false, message: 'Username must be 3-20 characters long and contain only letters, numbers, or underscores.' },
          { status: 400 }
        )
      }
      
      const existingUsernameUser = await prisma.user.findFirst({
        where: {
          username: normalizedUsername,
          email: { not: normalizedEmail }
        }
      })
      if (existingUsernameUser) {
        return NextResponse.json(
          { success: false, message: 'Username is already taken.' },
          { status: 409 }
        )
      }
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    const otp = createOtp()
    const hashedPassword = await hashPassword(password)

    if (existingUser) {
      if (existingUser.emailVerified) {
        return NextResponse.json(
          { success: false, message: 'An account with this email already exists.' },
          { status: 409 }
        )
      }

      await prisma.user.update({
        where: { id: existingUser.id },
        data: { 
          name: String(name).trim(),
          username: normalizedUsername
        },
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

      const emailSent = await sendVerificationEmail(normalizedEmail, otp)
      if (!emailSent) {
        return NextResponse.json(
          { success: false, message: 'Failed to send verification email. Please try again.' },
          { status: 503 }
        )
      }

      return NextResponse.json({ success: true, message: 'Verification code sent to your email.', email: normalizedEmail })
    }

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        username: normalizedUsername,
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

    const emailSent = await sendVerificationEmail(normalizedEmail, otp)
    if (!emailSent) {
      return NextResponse.json(
        { success: false, message: 'Failed to send verification email. Please try again.' },
        { status: 503 }
      )
    }

    return NextResponse.json({ success: true, message: 'Verification code sent to your email.', email: normalizedEmail })
  } catch (error) {
    console.error('Registration error', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
