import { NextResponse } from 'next/server'
import { redirectTarget, clearedCookieOptions } from '@/lib/auth'

export async function POST(request: Request) {
  const response = NextResponse.redirect(redirectTarget(request, '/login'), {
    status: 303,
  })
  response.cookies.set(clearedCookieOptions())
  return response
}
