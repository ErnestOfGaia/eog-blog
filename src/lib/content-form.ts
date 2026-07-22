// Shared parsing for the admin create/edit content forms (new model, 04 §3.3).

export interface ContentFormFields {
  title: string
  body: string
  excerpt: string | null
  tags: string // JSON array string
  cover_image: string | null
  cover_image_alt: string | null
  seo_title: string | null
  seo_description: string | null
  canonical_url: string | null
  discuss_linkedin_url: string | null
  publish_at: string | null // ISO8601 UTC (optional per-post override)
}

function field(fd: FormData, key: string, max = 0): string | null {
  const raw = fd.get(key)
  if (typeof raw !== 'string') return null
  const t = raw.trim()
  if (!t) return null
  return max > 0 ? t.slice(0, max) : t
}

/** Accept comma-separated or JSON-array tag input → canonical JSON array string. */
export function normalizeTags(raw: unknown): string {
  if (Array.isArray(raw)) {
    return JSON.stringify(
      raw.filter((t) => typeof t === 'string').map((t) => t.trim()).filter(Boolean)
    )
  }
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return JSON.stringify(
          parsed.filter((t) => typeof t === 'string').map((t) => t.trim()).filter(Boolean)
        )
      }
    } catch {
      /* fall through to comma-split */
    }
    return JSON.stringify(raw.split(',').map((t) => t.trim()).filter(Boolean))
  }
  return '[]'
}

export function parseContentForm(
  fd: FormData
): { fields: ContentFormFields } | { error: string } {
  const title = field(fd, 'title')
  const body = field(fd, 'body')
  if (!title) return { error: 'Title required' }
  if (!body) return { error: 'Body required' }

  return {
    fields: {
      title,
      body,
      excerpt: field(fd, 'excerpt'),
      tags: normalizeTags(fd.get('tags')),
      cover_image: field(fd, 'cover_image', 500),
      cover_image_alt: field(fd, 'cover_image_alt', 300),
      seo_title: field(fd, 'seo_title', 200),
      seo_description: field(fd, 'seo_description', 400),
      canonical_url: field(fd, 'canonical_url', 500),
      discuss_linkedin_url: field(fd, 'discuss_linkedin_url', 500),
      publish_at: field(fd, 'publish_at', 40),
    },
  }
}
