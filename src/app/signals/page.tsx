import type { Metadata } from 'next'
import { getDb } from '@/lib/db'
import { ContentSummary } from '@/types'
import { getSeriesLabel } from '@/lib/utils'
import NewsCard from '@/components/ui/NewsCard'

export const dynamic = 'force-dynamic'

const SIGNALS_DESCRIPTION =
  'All transmissions from the Coastal Command Center — build logs, reports, and dispatches, newest first.'

export const metadata: Metadata = {
  title: 'Signals — News Hub World',
  description: SIGNALS_DESCRIPTION,
  openGraph: {
    title: 'Signals — News Hub World',
    description: SIGNALS_DESCRIPTION,
    type: 'website',
    images: [{ url: '/home-banner.png', width: 1200, height: 630, alt: 'Signals — News Hub World' }],
  },
}

export default function SignalsPage() {
  const db = getDb()
  const items = db.prepare(
    `SELECT id, slug, title, excerpt, series, character, created_at
     FROM content
     WHERE status = 'published' AND tier = 'free'
     ORDER BY created_at DESC`
  ).all() as ContentSummary[]

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
      <header className="flex flex-col gap-2 border-l-2 border-nhw-cyan pl-4">
        <h1 className="text-headline-lg text-nhw-cyan uppercase">Signals</h1>
        <p className="text-body-md text-white/60">
          All transmissions from the Coastal Command Center, newest first.
        </p>
      </header>

      <section>
        <h2 className="text-label-lg text-nhw-cyan uppercase tracking-widest mb-6">
          ALL SIGNALS ──────────── ((•))
        </h2>

        {items.length === 0 ? (
          <p className="text-label-lg text-nhw-cyan/40 text-center py-12">
            NO SIGNALS ON FILE
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const href = item.character
                ? `/dispatch/${item.character}/${item.slug}`
                : `/articles/${item.slug}`
              return (
                <NewsCard
                  key={item.id}
                  seriesLabel={getSeriesLabel(item.series)}
                  date={item.created_at}
                  headline={item.title}
                  excerpt={item.excerpt}
                  href={href}
                />
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
