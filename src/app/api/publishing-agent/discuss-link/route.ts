// Narrow, single-field endpoint (design plan 04 — smallest playground): sets ONLY
// discuss_linkedin_url on a post, by slug or id. This is the backfill hook for the
// Blog→LinkedIn pipeline (02 §7a): publish → post to LinkedIn → set the "Discuss on
// LinkedIn" button to the specific thread. Cannot publish, edit body, or read admin.
// Auth: Bearer PUBLISHING_AGENT_API_KEY.

import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyBearer } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface Body {
  slug?: unknown
  id?: unknown
  discuss_linkedin_url?: unknown
}

export async function POST(req: NextRequest) {
  if (!verifyBearer(req, process.env.PUBLISHING_AGENT_API_KEY)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const url = typeof body.discuss_linkedin_url === 'string' ? body.discuss_linkedin_url.trim() : ''
  if (!/^https?:\/\/\S+$/.test(url)) {
    return NextResponse.json({ error: 'discuss_linkedin_url must be a valid http(s) URL' }, { status: 400 })
  }

  const db = getDb()
  let result
  if (typeof body.slug === 'string' && body.slug.trim()) {
    result = db.prepare('UPDATE content SET discuss_linkedin_url = ? WHERE slug = ?').run(url.slice(0, 500), body.slug.trim())
  } else if (typeof body.id === 'number' || (typeof body.id === 'string' && body.id.trim())) {
    const id = Number(body.id)
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    result = db.prepare('UPDATE content SET discuss_linkedin_url = ? WHERE id = ?').run(url.slice(0, 500), id)
  } else {
    return NextResponse.json({ error: 'Provide slug or id' }, { status: 400 })
  }

  if (result.changes === 0) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true, updated: result.changes }, { status: 200 })
}
