import { NextResponse } from 'next/server'
import {
  verifyPassword,
  sessionCookieOptions,
  redirectTarget,
  loginRateLimited,
  clientIp,
} from '@/lib/auth'

export async function POST(request: Request) {
  // Hardening tweak #3 — per-IP rate limit / lockout.
  if (loginRateLimited(clientIp(request))) {
    return NextResponse.redirect(redirectTarget(request, '/login?error=locked'), {
      status: 303,
    })
  }

  const formData = await request.formData()
  const password = formData.get('password')

  if (typeof password !== 'string' || !verifyPassword(password)) {
    return NextResponse.redirect(redirectTarget(request, '/login?error=1'), {
      status: 303,
    })
  }

  const response = NextResponse.redirect(redirectTarget(request, '/admin'), {
    status: 303,
  })
  response.cookies.set(sessionCookieOptions())
  return response
}
