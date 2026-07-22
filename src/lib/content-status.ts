import { getDb } from './db'
import type { Content, ContentStatus } from '@/types'
import { ALLOWED_TRANSITIONS, canTransition } from './content-transitions'

export { ALLOWED_TRANSITIONS, canTransition }

export class TransitionError extends Error {
  code: 'not_found' | 'illegal_transition' | 'missing_review_notes'
  constructor(code: TransitionError['code'], message: string) {
    super(message)
    this.code = code
  }
}

export interface ApplyTransitionOptions {
  reviewNotes?: string | null
  /** ISO8601 UTC. When approving, schedules the release instant. Ignored otherwise. */
  publishAt?: string | null
}

export function applyTransition(
  id: number,
  to: ContentStatus,
  { reviewNotes, publishAt }: ApplyTransitionOptions = {}
): Content {
  const db = getDb()
  const current = db.prepare('SELECT status FROM content WHERE id=?').get(id) as
    | { status: ContentStatus }
    | undefined

  if (!current) {
    throw new TransitionError('not_found', `Content ${id} not found`)
  }
  if (!canTransition(current.status, to)) {
    throw new TransitionError(
      'illegal_transition',
      `Cannot transition from ${current.status} to ${to}`
    )
  }
  if (to === 'changes_requested' && !reviewNotes?.trim()) {
    throw new TransitionError(
      'missing_review_notes',
      'review_notes required when transitioning to changes_requested'
    )
  }

  // Stamp published_at the moment a post first goes live.
  const publishedAtParam = to === 'published' ? new Date().toISOString() : null
  // Only set publish_at on approve (COALESCE keeps the existing value otherwise).
  const publishAtParam = to === 'approved' ? publishAt ?? null : null
  const notesParam = reviewNotes?.trim() || null

  db.prepare(
    `UPDATE content
       SET status = @to,
           review_notes = COALESCE(@notes, review_notes),
           published_at = COALESCE(@publishedAt, published_at),
           publish_at   = COALESCE(@publishAt, publish_at),
           updated_at = datetime('now')
     WHERE id = @id`
  ).run({
    to,
    notes: notesParam,
    publishedAt: publishedAtParam,
    publishAt: publishAtParam,
    id,
  })

  return db.prepare('SELECT * FROM content WHERE id=?').get(id) as Content
}
