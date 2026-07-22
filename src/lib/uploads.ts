import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

// Uploaded images live on the same volume as the SQLite DB (design plan 04 §3.2),
// so they persist at runtime with no code deploy and ride the same backups.
const DATA_DIR = path.dirname(process.env.DATABASE_URL ?? path.join(process.cwd(), 'data', 'blog.db'))
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads')

const MAX_BYTES = 6 * 1024 * 1024 // 6 MB

// Extension ← mime. SVG deliberately excluded (script-carrying XSS surface).
const MIME_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
}

export const EXT_MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
}

export interface SaveResult {
  ok: true
  filename: string
}
export interface SaveError {
  ok: false
  error: string
}

export async function saveUpload(file: File): Promise<SaveResult | SaveError> {
  const ext = MIME_EXT[file.type]
  if (!ext) return { ok: false, error: `Unsupported type "${file.type}". Allowed: PNG, JPEG, GIF, WebP.` }
  if (file.size > MAX_BYTES) return { ok: false, error: 'File too large (max 6 MB).' }

  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

  const filename = `${crypto.randomBytes(8).toString('hex')}.${ext}`
  const buf = Buffer.from(await file.arrayBuffer())
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), buf)
  return { ok: true, filename }
}

/** Resolve a requested media path safely inside UPLOAD_DIR (no traversal). */
export function resolveMediaPath(segments: string[]): string | null {
  const rel = segments.join('/')
  const resolved = path.resolve(UPLOAD_DIR, rel)
  if (resolved !== UPLOAD_DIR && !resolved.startsWith(UPLOAD_DIR + path.sep)) return null
  return resolved
}
