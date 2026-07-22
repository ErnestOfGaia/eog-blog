import Link from 'next/link'
import { getDb } from '@/lib/db'
import type { ContentSummary } from '@/types'
import { formatDate, parseTags, readingTimeMinutes, deriveExcerpt } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type IndexRow = Pick<
  ContentSummary,
  'slug' | 'title' | 'excerpt' | 'tags' | 'published_at'
> & { body_preview: string }

export default function BlogIndex() {
  const db = getDb()
  const rows = db
    .prepare(
      `SELECT slug, title, excerpt, tags, published_at, substr(body, 1, 400) AS body_preview
       FROM content
       WHERE status = 'published'
       ORDER BY published_at DESC
       LIMIT 100`
    )
    .all() as IndexRow[]

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-eog-navy">Blog</h1>
        <p className="mt-2 text-stone-600">
          Notes on building, learning, and helping people put AI to work.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="text-stone-500">No posts yet — check back soon.</p>
      ) : (
        <ul className="space-y-10">
          {rows.map((post) => {
            const tags = parseTags(post.tags)
            const excerpt = post.excerpt ?? deriveExcerpt(post.body_preview)
            return (
              <li key={post.slug}>
                <article>
                  <h2 className="text-xl font-semibold text-eog-navy">
                    <Link href={`/${post.slug}`} className="hover:text-eog-teal transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500">
                    {post.published_at && <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>}
                    <span aria-hidden="true">·</span>
                    <span>{readingTimeMinutes(post.body_preview)} min read</span>
                  </div>
                  {excerpt && <p className="mt-2 text-stone-700">{excerpt}</p>}
                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tags.map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-eog-cream text-eog-navy">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link href={`/${post.slug}`} className="mt-2 inline-block text-sm font-medium text-eog-teal hover:underline">
                    Read →
                  </Link>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
