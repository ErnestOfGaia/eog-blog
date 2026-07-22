import type { MetadataRoute } from 'next'
import { getDb } from '@/lib/db'
import { siteConfig } from '@/lib/config'
import { BASE_PATH } from '@/lib/paths'

export const dynamic = 'force-dynamic'

const BASE = `${siteConfig.url}${BASE_PATH}`

export default function sitemap(): MetadataRoute.Sitemap {
  const db = getDb()
  const rows = db
    .prepare(
      `SELECT slug, updated_at FROM content
       WHERE status = 'published'
       ORDER BY published_at DESC`
    )
    .all() as { slug: string; updated_at: string }[]

  const posts: MetadataRoute.Sitemap = rows.map((r) => ({
    url: `${BASE}/${r.slug}`,
    lastModified: new Date(r.updated_at),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...posts,
  ]
}
