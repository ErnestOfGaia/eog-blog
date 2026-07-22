// Character Development Records — image upload helper (D3).
// Writes committed-style brand reference images under public/character-records/<slug>/<recordId>/.
// (Distinct from public/media/*, which is gitignored runtime panel output.)
import path from 'path'
import fs from 'fs/promises'

const ALLOWED = new Map<string, string>([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
])
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export type SavedUpload = { ok: true; publicPath: string } | { ok: false; error: string }

function safeStem(name: string): string {
  const stem = name.replace(/\.[^.]+$/, '')
  return (
    stem
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'image'
  )
}

// `index` keeps multiple uploads to the same record from colliding without needing
// Date.now()/random (which are unavailable in some sandboxed contexts anyway).
export async function saveCharacterAsset(
  file: File,
  slug: string,
  recordId: number,
  index: number
): Promise<SavedUpload> {
  if (!file || typeof file.arrayBuffer !== 'function') {
    return { ok: false, error: 'No file provided' }
  }
  const ext = ALLOWED.get(file.type)
  if (!ext) {
    return { ok: false, error: `Unsupported type ${file.type || '(none)'} — use png/jpg/webp/gif` }
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: `File too large (${Math.round(file.size / 1024 / 1024)}MB > 10MB)` }
  }

  const dir = path.join(process.cwd(), 'public', 'character-records', slug, String(recordId))
  await fs.mkdir(dir, { recursive: true })

  const filename = `${String(index).padStart(2, '0')}-${safeStem(file.name)}.${ext}`
  const abs = path.join(dir, filename)
  const buf = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(abs, buf)

  // Public URL path (forward slashes regardless of OS).
  return { ok: true, publicPath: `/character-records/${slug}/${recordId}/${filename}` }
}

// Best-effort delete of a file previously saved under public/. Never throws.
export async function deletePublicFile(publicPath: string | null | undefined): Promise<void> {
  if (!publicPath || !publicPath.startsWith('/character-records/')) return
  try {
    const abs = path.join(process.cwd(), 'public', publicPath.replace(/^\//, ''))
    await fs.unlink(abs)
  } catch {
    /* file may already be gone — ignore */
  }
}
