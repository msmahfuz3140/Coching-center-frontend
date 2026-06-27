import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
})

type OtpPurpose = 'verification' | 'password-reset'

const otpEmailContent: Record<OtpPurpose, { subject: string; title: string }> = {
    verification: {
        subject: 'Email Verification - Coaching Center',
        title: 'Email Verification',
    },
    'password-reset': {
        subject: 'Password Reset Code - Coaching Center',
        title: 'Password Reset',
    },
}

export async function sendVerificationEmail(
    email: string,
    otp: string,
    purpose: OtpPurpose = 'verification',
    expiresInMinutes = purpose === 'password-reset' ? 10 : 5
) {
    const { subject, title } = otpEmailContent[purpose]

    try {
        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            console.log(`[DEV] ${purpose} OTP for ${email}: ${otp}`)
            return true
        }

        await transporter.sendMail({
            from: process.env.SMTP_EMAIL,
            to: email,
            subject,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${title}</h2>
          <p>Your verification code is:</p>
          <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center;">
            <h1 style="color: #2563eb; letter-spacing: 2px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">This code expires in ${expiresInMinutes} minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
        })

        return true
    } catch (error) {
        console.error('Failed to send email:', error)
        return false
    }
}

export async function sendPasswordResetEmail(
    email: string,
    resetLink: string
) {
    try {
        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            console.log(`[DEV] Reset link for ${email}: ${resetLink}`)
            return true
        }

        await transporter.sendMail({
            from: process.env.SMTP_EMAIL,
            to: email,
            subject: 'Password Reset - Coaching Center',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetLink}" style="background: #2563eb; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
        })

        return true
    } catch (error) {
        console.error('Failed to send email:', error)
        return false
    }
}
