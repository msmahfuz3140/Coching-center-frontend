import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV || 'NOT SET',
  })
}
