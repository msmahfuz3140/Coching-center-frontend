# Email Setup Guide

## Gmail Configuration (Recommended - Free)

### Step 1: Enable Gmail App Password

1. Go to [Google Account](https://myaccount.google.com/)
2. Select **Security** from the left menu
3. Under **How you sign in to Google**, select **App passwords** (only available if 2-Step Verification is enabled)
   - If you don't see this option, enable **2-Step Verification** first
4. Select **Mail** and **Windows Computer** (or your device)
5. Google will generate a 16-character password
6. Copy this password (without spaces)

### Step 2: Update .env

Add your Gmail credentials to `.env`:

```
SMTP_EMAIL=your-gmail@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
```

Replace `xxxx xxxx xxxx xxxx` with the 16-character app password (remove spaces if any).

### Step 3: Test Email Sending

1. Register a new account at `http://localhost:3000/register`
2. Check your email inbox for the verification code
3. If you don't receive it, check spam folder
4. Console logs will show: `[OTP] registration code for email@example.com: 123456`

## Troubleshooting

### Gmail Not Sending

- Ensure 2-Step Verification is enabled on your Google Account
- Check that the app password was copied correctly (16 characters)
- Allow 5-10 seconds for Gmail to deliver the email
- Check spam/promotions folder

### Alternative: Leave Empty for Development

If you want to skip email setup for now:

1. Keep `SMTP_EMAIL` and `SMTP_PASSWORD` empty in `.env`
2. OTP codes will be logged to console only
3. You can still test verification by manually copying the OTP from logs

## Production Setup

For production, consider:

- **Resend** (recommended) - Very easy, professional emails
- **SendGrid** - Free 100 emails/day
- **AWS SES** - Low cost at scale
