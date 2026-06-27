import fs from 'node:fs'
import path from 'node:path'
import nodemailer from 'nodemailer'

const envPath = path.join(process.cwd(), '.env')
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const index = line.indexOf('=')
      return [line.slice(0, index), line.slice(index + 1)]
    })
)

const smtpEmail = env.SMTP_EMAIL?.trim()
const smtpPassword = env.SMTP_PASSWORD?.trim()
const testRecipient = process.argv[2] || smtpEmail

if (!smtpEmail || !smtpPassword) {
  console.error('SMTP_EMAIL and SMTP_PASSWORD must be set in .env')
  process.exit(1)
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: smtpEmail,
    pass: smtpPassword,
  },
})

const otp = '123456'

await transporter.sendMail({
  from: smtpEmail,
  to: testRecipient,
  subject: 'Test Email - Coaching Center',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Email Test Successful</h2>
      <p>Your Coaching Center app can send emails.</p>
      <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center;">
        <h1 style="color: #2563eb; letter-spacing: 2px; margin: 0;">${otp}</h1>
      </div>
    </div>
  `,
})

console.log(`Test email sent to ${testRecipient}`)
