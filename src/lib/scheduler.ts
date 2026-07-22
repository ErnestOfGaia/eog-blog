import { getDb } from './db'
import { siteConfig } from './config'
import { applyTransition } from './content-status'
import { wallTimeToUtc, zonedYmd } from './time'

// ── Cadence-slot assignment (design plan 04 §3.5) ────────────────────────────
// Auto-assign the next open daily slot at the configured local hour (default
// 9am Pacific). One post per slot; skips slots already taken by an approved or
// published post. Returns an ISO8601 UTC string.
export function nextPublishSlot(now: Date = new Date()): string {
  const db = getDb()
  const { hour, minute, cadenceDays, timezone } = siteConfig.schedule

  const taken = new Set(
    (
      db
        .prepare(
          `SELECT publish_at FROM content
           WHERE publish_at IS NOT NULL AND status IN ('approved','published')`
        )
        .all() as { publish_at: string }[]
    ).map((r) => r.publish_at)
  )

  let { y, m0, d } = zonedYmd(now, timezone)
  for (let i = 0; i < 730; i++) {
    const slot = wallTimeToUtc(y, m0, d, hour, minute, timezone)
    const iso = slot.toISOString()
    if (slot.getTime() > now.getTime() && !taken.has(iso)) return iso
    // advance by cadenceDays via a noon-UTC anchor (same Pacific calendar day,
    // DST-safe) then read the next calendar date back.
    const anchor = new Date(Date.UTC(y, m0, d, 12))
    anchor.setUTCDate(anchor.getUTCDate() + Math.max(1, cadenceDays))
    y = anchor.getUTCFullYear()
    m0 = anchor.getUTCMonth()
    d = anchor.getUTCDate()
  }
  return new Date(now.getTime() + 60_000).toISOString() // fallback (unreachable)
}

// ── Scheduled release (design plan 04 §3.5) ──────────────────────────────────
// Promote every approved post whose publish_at is due. Called by the Bearer-authed
// /api/cron/publish-due endpoint (VPS system cron, ~every 15 min).
export function publishDuePosts(
  now: Date = new Date()
): { published: number; ids: number[]; posts: { id: number; slug: string }[] } {
  const db = getDb()
  const nowIso = now.toISOString()
  const due = db
    .prepare(
      `SELECT id, slug FROM content
       WHERE status='approved' AND publish_at IS NOT NULL AND publish_at <= ?
       ORDER BY publish_at ASC`
    )
    .all(nowIso) as { id: number; slug: string }[]

  for (const { id } of due) {
    applyTransition(id, 'published')
  }
  // `posts` gives the Blog→LinkedIn routine the slug of each newly-live post so it
  // can build the LinkedIn post and backfill the discuss link (02 §7a).
  return { published: due.length, ids: due.map((r) => r.id), posts: due }
}
