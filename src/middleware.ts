import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const sessionToken = request.cookies.get('better-auth.session_token')?.value || 
                       request.cookies.get('__Secure-better-auth.session_token')?.value

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // If trying to access protected route without session token, redirect to login
  if (isProtectedRoute && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
}
