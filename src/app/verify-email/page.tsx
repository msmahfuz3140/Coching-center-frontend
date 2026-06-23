'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import toast from 'react-hot-toast'

function VerifyEmailContent() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [verified, setVerified] = useState(false)
  const [email, setEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      handleVerify(token)
    }
  }, [token])

  const handleVerify = async (verificationToken: string) => {
    setIsVerifying(true)
    try {
      const { error } = await authClient.verifyEmail({
        query: { token: verificationToken },
      })
      if (error) throw new Error(error.message || 'Verification failed')
      setVerified(true)
      toast.success('Email verified successfully!', { duration: 3000, position: 'top-right' })
      setTimeout(() => router.push('/login'), 2000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Verification failed', {
        duration: 5000, position: 'top-right',
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (!email) return
    setIsResending(true)
    try {
      const { error } = await authClient.sendVerificationEmail({ email })
      if (error) throw new Error(error.message || 'Failed to resend')
      toast.success('Verification email sent!', { duration: 3000, position: 'top-right' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend', {
        duration: 5000, position: 'top-right',
      })
    } finally {
      setIsResending(false)
    }
  }

  if (verified) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
        <p className="text-gray-600 mb-6">Your email has been verified successfully.</p>
        <Link href="/login" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700">
          Continue to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
      <p className="text-gray-600 mb-8">Please check your email for the verification link.</p>

      {token ? (
        <div className="space-y-4">
          <button
            onClick={() => handleVerify(token)}
            disabled={isVerifying}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
          >
            {isVerifying ? 'Verifying...' : 'Click to Verify Email'}
          </button>
        </div>
      ) : (
        <div className="max-w-sm mx-auto space-y-4">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleResend}
            disabled={isResending || !email}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
          >
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </div>
      )}

      <div className="mt-6">
        <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
          Back to Login
        </Link>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-100">
        <Suspense fallback={<div className="text-center py-12"><p className="text-gray-600">Loading...</p></div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  )
}