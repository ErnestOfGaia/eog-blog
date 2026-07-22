// Publishing-agent intake (design plan 04). The agent's ONLY capability: create
// one row at status='pending_review'. It cannot publish, edit, or read admin.
// Auth: Bearer PUBLISHING_AGENT_API_KEY.

import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyBearer } from '@/lib/auth'
import { slugify, uniqueSlug } from '@/lib/utils'
import { runContentGuard } from '@/lib/content-guard'

interface DraftBody {
  title?: unknown
  slug?: unknown
  body?: unknown
  excerpt?: unknown
  tags?: unknown
  cover_image?: unknown
  cover_image_alt?: unknown
  seo_title?: unknown
  seo_description?: unknown
  canonical_url?: unknown
  discuss_linkedin_url?: unknown
}

function asTrimmedString(v: unknown, max = 0): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  if (!t) return null
  return max > 0 ? t.slice(0, max) : t
}

function normalizeTags(v: unknown): string {
  if (Array.isArray(v)) {
    return JSON.stringify(
      v.filter((t) => typeof t === 'string').map((t) => t.trim()).filter(Boolean)
    )
  }
  if (typeof v === 'string' && v.trim()) {
    try {
      const parsed = JSON.parse(v)
      if (Array.isArray(parsed)) {
        return JSON.stringify(parsed.filter((t) => typeof t === 'string'))
      }
    } catch {
      return JSON.stringify(v.split(',').map((t) => t.trim()).filter(Boolean))
    }
  }
  return '[]'
}

export async function POST(req: NextRequest) {
  if (!verifyBearer(req, process.env.PUBLISHING_AGENT_API_KEY)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: DraftBody
  try {
    payload = (await req.json()) as DraftBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const title = asTrimmedString(payload.title)
  const body = asTrimmedString(payload.body)
  if (!title || !body) {
    return NextResponse.json({ error: 'title and body are required' }, { status: 400 })
  }

  const excerpt = asTrimmedString(payload.excerpt)

  // Advisory content-guard. Findings are always returned; they only BLOCK when
  // the hard-gate is enabled (client-template escalation).
  const guard = runContentGuard({ title, body, excerpt })
  if (!guard.ok && guard.hardGate) {
    return NextResponse.json(
      { error: 'Content guard blocked this draft', findings: guard.findings },
      { status: 422 }
    )
  }

  try {
    const db = getDb()
    const slugBase = slugify(asTrimmedString(payload.slug) ?? title)
    const slug = uniqueSlug(db, slugBase)

    const result = db
      .prepare(
        `INSERT INTO content
           (slug, title, body, excerpt, tags, cover_image, cover_image_alt,
            seo_title, seo_description, canonical_url, discuss_linkedin_url,
            status, author)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review', 'publishing_agent')`
      )
      .run(
        slug,
        title,
        body,
        excerpt,
        normalizeTags(payload.tags),
        asTrimmedString(payload.cover_image, 500),
        asTrimmedString(payload.cover_image_alt, 300),
        asTrimmedString(payload.seo_title, 200),
        asTrimmedString(payload.seo_description, 400),
        asTrimmedString(payload.canonical_url, 500),
        asTrimmedString(payload.discuss_linkedin_url, 500)
      )
    const id = Number(result.lastInsertRowid)
    return NextResponse.json(
      { id, slug, adminUrl: `/admin/${id}`, guard: guard.findings },
      { status: 201 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
