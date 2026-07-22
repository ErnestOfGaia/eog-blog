import type { Metadata } from 'next'
import { getDb } from '@/lib/db'
import { ContentSummary } from '@/types'
import { getSeriesLabel } from '@/lib/utils'
import CharacterCard from '@/components/ui/CharacterCard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const COMICS_DESCRIPTION =
  'Comic Strips — The Archive. Visual logs and stories from the Coastal Command Center.'

export const metadata: Metadata = {
  title: 'Comic Strips Archive — News Hub World',
  description: COMICS_DESCRIPTION,
  openGraph: {
    title: 'Comic Strips Archive — News Hub World',
    description: COMICS_DESCRIPTION,
    type: 'website',
    images: [
      {
        url: '/comics-banner.png',
        width: 1200,
        height: 630,
        alt: 'Comic Strips — The Archive',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comic Strips Archive — News Hub World',
    description: COMICS_DESCRIPTION,
    images: ['/comics-banner.png'],
  },
}

// C2/C5 — extract cover image from comic_panels (handles both shapes:
//   legacy string[]  →  panels[0] is a path string
//   new PanelObject  →  panels[0].image is a path string)
function extractCover(comic_panels: string | null): string | null {
  if (!comic_panels) return null
  try {
    const parsed = JSON.parse(comic_panels)
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    const first = parsed[0]
    return typeof first === 'string' ? first : (first?.image ?? null)
  } catch {
    return null
  }
}

export default function ComicsDispatchPage() {
  const db = getDb()
  const posts = db.prepare(
    `SELECT id, slug, title, excerpt, series, character, created_at, comic_panels
     FROM content WHERE character = 'comics' AND status = 'published' ORDER BY created_at DESC`
  ).all() as ContentSummary[]

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10">

      <CharacterCard
        name="COMIC STRIPS"
        role="The Archive"
        statusLine="AVAILABLE"
        description="Visual logs and stories from the Coastal Command Center."
        href="/dispatch/comics"
        portraitSrc="/comics-banner.png"
      />

      <section>
        <h2 className="text-label-lg text-nhw-cyan uppercase tracking-widest mb-6">
          TRANSMISSIONS ──────────── ((•))
        </h2>

        {posts.length === 0 ? (
          <p className="text-label-lg text-nhw-cyan/40 text-center py-12">
            NO TRANSMISSIONS ON FILE
          </p>
        ) : (
          // C2/C5: 2-col grid on mobile, 3-col on md+ — shelf-like tappable cards
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {posts.map((post) => {
              const cover = extractCover(post.comic_panels)

              return (
                <Link
                  key={post.id}
                  href={`/dispatch/comics/${post.slug}`}
                  className="group flex flex-col rounded-sm overflow-hidden border border-nhw-cyan/30 hover:border-nhw-cyan/60 bg-nhw-surface transition-colors duration-200 active:scale-[0.98]"
                  aria-label={`Open comic: ${post.title}`}
                >
                  {/* Cover image */}
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-nhw-bg shrink-0">
                    {cover ? (
                      <img
                        src={cover}
                        alt={`Cover: ${post.title}`}
                        className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-nhw-cyan/20 text-label-sm uppercase tracking-widest">
                          NO COVER
                        </span>
                      </div>
                    )}
                    {/* Gradient overlay for text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-nhw-bg/80 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Metadata below the cover */}
                  <div className="flex flex-col gap-1 p-3">
                    {post.series && (
                      <span className="text-label-sm text-nhw-amber uppercase tracking-widest truncate">
                        {getSeriesLabel(post.series)}
                      </span>
                    )}
                    <h3 className="text-body-md text-nhw-cyan font-semibold leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-body-sm text-white/50 leading-snug line-clamp-2 mt-0.5">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
