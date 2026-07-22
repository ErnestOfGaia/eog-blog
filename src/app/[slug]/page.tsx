import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import type { Content } from '@/types'
import { siteConfig } from '@/lib/config'
import { BASE_PATH } from '@/lib/paths'
import { formatDate, parseTags, readingTimeMinutes, deriveExcerpt } from '@/lib/utils'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer'

export const dynamic = 'force-dynamic'

function getPost(slug: string): Content | undefined {
  const db = getDb()
  return db
    .prepare(`SELECT * FROM content WHERE slug = ? AND status = 'published'`)
    .get(slug) as Content | undefined
}

function postUrl(slug: string): string {
  return `${siteConfig.url}${BASE_PATH}/${slug}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return { title: 'Not found' }

  const title = post.seo_title ?? post.title
  const description = post.seo_description ?? post.excerpt ?? deriveExcerpt(post.body)
  const canonical = post.canonical_url ?? postUrl(slug)

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title,
      description,
      url: postUrl(slug),
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image ? [{ url: post.cover_image, alt: post.cover_image_alt ?? title }] : undefined,
    },
    twitter: {
      card: post.cover_image ? 'summary_large_image' : 'summary',
      title,
      description,
    },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const tags = parseTags(post.tags)
  const description = post.seo_description ?? post.excerpt ?? deriveExcerpt(post.body)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    author: { '@type': 'Person', name: siteConfig.name },
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl(slug) },
    ...(post.cover_image ? { image: [post.cover_image] } : {}),
    keywords: tags.join(', ') || undefined,
  }

  return (
    <main className="max-w-prose mx-auto px-4 sm:px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold leading-tight text-eog-navy">{post.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500">
            {post.published_at && <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>}
            <span aria-hidden="true">·</span>
            <span>{readingTimeMinutes(post.body)} min read</span>
          </div>
        </header>

        {post.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt={post.cover_image_alt ?? post.title}
            className="w-full rounded-lg mb-8"
          />
        )}

        <MarkdownRenderer content={post.body} />

        {tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-eog-cream text-eog-navy">
                {t}
              </span>
            ))}
          </div>
        )}
      </article>

      <div className="mt-10 pt-6 border-t border-eog-navy/10">
        <a
          href={post.discuss_linkedin_url ?? siteConfig.social.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-eog-teal px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Discuss on LinkedIn →
        </a>
      </div>
    </main>
  )
}
