import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { siteConfig } from '@/lib/config'
import { BASE_PATH } from '@/lib/paths'
import { deriveExcerpt } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const BASE = `${siteConfig.url}${BASE_PATH}`

export async function GET() {
  const db = getDb()
  const items = db
    .prepare(
      `SELECT slug, title, excerpt, body, published_at
       FROM content WHERE status='published'
       ORDER BY published_at DESC LIMIT 50`
    )
    .all() as {
    slug: string
    title: string
    excerpt: string | null
    body: string
    published_at: string | null
  }[]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${siteConfig.name} — Blog</title>
  <description>${siteConfig.description}</description>
  <link>${BASE}</link>
  <language>en-us</language>
  <atom:link href="${BASE}/rss.xml" rel="self" type="application/rss+xml" />
  ${items
    .map((item) => {
      const link = `${BASE}/${item.slug}`
      const desc = item.excerpt ?? deriveExcerpt(item.body, 200)
      const pub = item.published_at ? new Date(item.published_at).toUTCString() : ''
      return `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${link}</link>
      <description><![CDATA[${desc}]]></description>
      <pubDate>${pub}</pubDate>
      <guid isPermaLink="true">${link}</guid>
    </item>`
    })
    .join('')}
</channel>
</rss>`

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
