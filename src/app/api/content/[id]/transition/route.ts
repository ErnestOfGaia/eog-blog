import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth'
import { applyTransition, TransitionError } from '@/lib/content-status'
import { nextPublishSlot } from '@/lib/scheduler'
import type { ContentStatus } from '@/types'

const VALID_STATUSES: ContentStatus[] = [
  'draft',
  'pending_review',
  'changes_requested',
  'approved',
  'published',
]

function isContentStatus(v: unknown): v is ContentStatus {
  return typeof v === 'string' && (VALID_STATUSES as string[]).includes(v)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdminApi()
  if (unauth) return unauth

  const id = parseInt((await params).id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  let body: { status?: unknown; review_notes?: unknown; publish_at?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!isContentStatus(body.status)) {
    return NextResponse.json({ error: 'Invalid or missing status' }, { status: 400 })
  }

  const reviewNotes = typeof body.review_notes === 'string' ? body.review_notes : undefined

  // On approve: use an explicit publish_at if supplied, else auto-assign the next
  // open cadence slot (daily 9am Pacific). This is what makes "posts release on a
  // schedule" work — the cron endpoint later promotes approved→published when due.
  let publishAt: string | undefined
  if (body.status === 'approved') {
    publishAt =
      typeof body.publish_at === 'string' && body.publish_at.trim()
        ? new Date(body.publish_at).toISOString()
        : nextPublishSlot()
  }

  try {
    const row = applyTransition(id, body.status, { reviewNotes, publishAt })
    return NextResponse.json(row, { status: 200 })
  } catch (err) {
    if (err instanceof TransitionError) {
      const status = err.code === 'not_found' ? 404 : 400
      return NextResponse.json({ error: err.message, code: err.code }, { status })
    }
    throw err
  }
}
