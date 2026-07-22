// Serves runtime-uploaded images from the volume at /blog/media/<file>.
// Public (post images must be viewable); path-traversal guarded.
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { resolveMediaPath, EXT_MIME } from '@/lib/uploads'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params
  const filePath = resolveMediaPath(segments ?? [])
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return new NextResponse('Not found', { status: 404 })
  }

  const ext = path.extname(filePath).slice(1).toLowerCase()
  const contentType = EXT_MIME[ext] ?? 'application/octet-stream'
  const data = fs.readFileSync(filePath)

  return new NextResponse(new Uint8Array(data), {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
