import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { Content } from '@/types'
import type { Metadata } from 'next'
import ComicDetailClient from './ComicDetailClient'

// C3 — 2026-06-01: comic detail is now a thin server shell that fetches data
// and hands off to ComicDetailClient for the full-screen ComicStripViewer.
// The server component keeps generateMetadata (needs async params) and the DB
// query; the client component owns all interactive viewer state.

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const db = getDb()
  const post = db.prepare(
    `SELECT title, excerpt, comic_panels FROM content WHERE character = 'comics' AND slug = ? AND status = 'published'`
  ).get(slug) as Pick<Content, 'title' | 'excerpt' | 'comic_panels'> | undefined

  if (!post) return {}

  const description = post.excerpt ?? undefined
  const ogTitle = `${post.title} — Comic Strips Archive`
  // Cover: handle both legacy string[] and new PanelObject[] shapes
  const panels = post.comic_panels ? JSON.parse(post.comic_panels) : []
  const first = panels[0]
  const ogImage = first
    ? (typeof first === 'string' ? first : (first?.image ?? '/comics-banner.png'))
    : '/comics-banner.png'

  return {
    title: post.title,
    description,
    openGraph: {
      title: ogTitle,
      description,
      type: 'article',
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [ogImage],
    },
  }
}

export default async function ComicsPostPage({ params }: Props) {
  const { slug } = await params
  const db = getDb()
  const post = db.prepare(
    `SELECT * FROM content WHERE character = 'comics' AND slug = ? AND status = 'published'`
  ).get(slug) as Content | undefined

  if (!post) notFound()

  const panels = post.comic_panels ? JSON.parse(post.comic_panels) : []

  return (
    <ComicDetailClient
      title={post.title}
      panels={panels}
      tier={post.tier}
    />
  )
}
