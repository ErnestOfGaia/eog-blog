import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import crypto, { timingSafeEqual } from 'crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { BASE_PATH } from './paths'

const COOKIE_NAME = 'admin_session'
const MAX_AGE = 60 * 60 * 24 * 7
const IS_PROD = process.env.NODE_ENV === 'production'
const SALT = process.env.SESSION_SALT ?? 'eog-blog-salt'

function getToken(): string {
  return crypto
    .createHash('sha256')
    .update((process.env.ADMIN_PASSWORD ?? '') + SALT)
    .digest('hex')
}

/** Constant-time string compare (hardening tweak #2). */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

export async function checkAdminSession(): Promise<boolean> {
  const store = await cookies()
  const value = store.get(COOKIE_NAME)?.value
  if (!value) return false
  return safeEqual(value, getToken())
}

export async function requireAdmin(): Promise<void> {
  if (!(await checkAdminSession())) redirect('/login')
}

// For API route handlers: 401 JSON when not an authenticated admin, else null.
export async function requireAdminApi(): Promise<NextResponse | null> {
  if (await checkAdminSession()) return null
  return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? ''
  if (!expected) return false
  return safeEqual(input, expected) // hardening tweak #2 (was plain ===)
}

export function sessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    value: getToken(),
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: IS_PROD, // hardening tweak #1 — HTTPS-only cookie in prod
    maxAge: MAX_AGE,
    path: '/',
  }
}

export function clearedCookieOptions() {
  return {
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: IS_PROD,
    maxAge: 0,
    path: '/',
  }
}

// Build an absolute redirect URL from the incoming request's Host header (behind
// the reverse proxy request.url reflects the container's internal bind address).
// basePath-aware so redirects land under /blog.
export function redirectTarget(request: Request, path: string): string {
  const host = request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}${BASE_PATH}${path}`
}

// ── Generic Bearer verification (publishing-agent + cron), constant-time ─────
export function verifyBearer(req: NextRequest, expected: string | undefined): boolean {
  if (!expected) return false
  const header = req.headers.get('authorization') ?? ''
  if (!header.startsWith('Bearer ')) return false
  const presented = header.slice('Bearer '.length)
  try {
    const a = Buffer.from(presented)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

// ── Login rate-limit (hardening tweak #3) ────────────────────────────────────
// In-memory per-IP limiter. Single-instance, resets on restart — sufficient for
// a solo-admin login. Returns true when the caller should be blocked.
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10
const attempts = new Map<string, { count: number; first: number }>()

export function loginRateLimited(ip: string, now: number = Date.now()): boolean {
  const rec = attempts.get(ip)
  if (!rec || now - rec.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: now })
    return false
  }
  rec.count += 1
  return rec.count > MAX_ATTEMPTS
}

export function clientIp(req: NextRequest | Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}
