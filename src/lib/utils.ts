import type Database from 'better-sqlite3'
import { formatInZone } from './time'

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function uniqueSlug(db: Database.Database, base: string): string {
  const safeBase = base || 'post'
  const rows = db
    .prepare('SELECT slug FROM content WHERE slug = ? OR slug LIKE ?')
    .all(safeBase, `${safeBase}-%`) as { slug: string }[]
  const existing = new Set(rows.map((r) => r.slug))
  if (!existing.has(safeBase)) return safeBase
  let n = 2
  while (existing.has(`${safeBase}-${n}`)) n++
  return `${safeBase}-${n}`
}

/** Human date in the site timezone (e.g. "July 21, 2026"). */
export function formatDate(isoUtc: string): string {
  return formatInZone(isoUtc)
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/** Parse the JSON `tags` column into a string[] (tolerant of bad data). */
export function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((t) => typeof t === 'string') : []
  } catch {
    return []
  }
}

/** Reading time in minutes from markdown body (~225 wpm), min 1. */
export function readingTimeMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 225))
}

/** First N chars of body stripped of markdown, for a derived excerpt. */
export function deriveExcerpt(body: string, maxLength = 160): string {
  const plain = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return truncate(plain, maxLength)
}
