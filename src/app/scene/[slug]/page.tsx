import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPublicRecords, getPublicAssets } from '@/lib/character-records'
import { getDb } from '@/lib/db'
import { Content } from '@/types'

export const dynamic = 'force-dynamic'

type SceneRecord = {
  name: string
  role: string
  image: string
  summary: string
  facts: { label: string; value: string }[]
}

const SCENES: Record<string, SceneRecord> = {
  'command-center': {
    name: 'Coastal Command Center',
    role: 'Setting — Location',
    image: '/lore/header.png',
    summary:
      'The stage: a maritime-industrial signal station perched on a weathered sea cliff. It is the primary node of the tidal grid, constructed from driftwood beams and rusted antenna struts. This is where the crew monitors the data horizon, metabolizes noise, and holds a single honest signal against the waves.',
    facts: [
      { label: 'Type', value: 'Maritime-industrial signal station / control room' },
      { label: 'Purpose', value: 'Keeping one honest signal alive (anti-drift proof of work)' },
      {
        label: 'Visual anchors',
        value:
          'Metallic window framing · twin console stations (Sector 7B & Tidal Grid) · warm interior hanging bulbs · distant lighthouse tower island · sunset horizon view',
      },
      {
        label: 'Render PR',
        value: 'PR #0001 (Signal Found) — merged by zClaude from an undisclosed location',
      },
    ],
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const s = SCENES[slug]
  if (!s) return {}
  return { title: `${s.name} — Location`, description: s.summary }
}

export default async function ScenePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const s = SCENES[slug]
  if (!s) notFound()

  const db = getDb()
  // Check if the "Signal Found" comic is published to show the visual link
  const signalFoundComic = db
    .prepare("SELECT slug, title, excerpt FROM content WHERE character = 'comics' AND slug = 'signal-found' AND status = 'published' LIMIT 1")
    .get() as Pick<Content, 'slug' | 'title' | 'excerpt'> | undefined

  // Curated public Development Records (is_public only) for setting drift anchor
  const records = getPublicRecords(slug).map((r) => ({
    record: r,
    assets: getPublicAssets(r.id),
  }))

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10">
      <Link href="/lore" className="text-label-sm text-nhw-cyan hover:opacity-70 transition-opacity">
        &larr; WORLD LORE
      </Link>

      <header className="flex gap-5 items-start border-l-2 border-nhw-amber pl-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={s.image}
          alt={s.name}
          className="w-28 h-28 md:w-36 md:h-36 object-cover rounded-sm border border-nhw-cyan/20 shrink-0"
        />
        <div className="flex flex-col gap-2">
          <h1 className="text-headline-lg text-nhw-cyan uppercase">{s.name}</h1>
          <span className="text-label-sm text-nhw-amber/80 uppercase tracking-widest">
            {s.role}
          </span>
          <p className="text-body-md text-white/70">{s.summary}</p>
        </div>
      </header>

      {/* Comic Link CTA */}
      {signalFoundComic && (
        <section className="border border-nhw-cyan/30 rounded-sm p-5 bg-nhw-surface flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-label-sm text-nhw-amber uppercase tracking-widest">SIGNAL DETECTED</span>
            <h3 className="text-body-lg text-nhw-cyan font-bold">{signalFoundComic.title}</h3>
            <p className="text-body-md text-white/60">{signalFoundComic.excerpt}</p>
          </div>
          <Link
            href={`/dispatch/comics/${signalFoundComic.slug}`}
            className="px-4 py-2 border border-nhw-cyan text-label-md text-nhw-cyan uppercase tracking-widest hover:bg-nhw-cyan hover:text-nhw-bg transition-colors shrink-0"
          >
            View Strip &rarr;
          </Link>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-label-lg text-nhw-cyan uppercase tracking-widest">CANON</h2>
        <dl className="flex flex-col gap-3">
          {s.facts.map((f) => (
            <div key={f.label} className="border-l-2 border-nhw-cyan/20 pl-4">
              <dt className="text-label-sm text-nhw-cyan/60 uppercase tracking-widest">{f.label}</dt>
              <dd className="text-body-md text-white/70">{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-label-lg text-nhw-cyan uppercase tracking-widest">DEVELOPMENT RECORDS (DRIFT ANCHORS)</h2>
        {records.length === 0 ? (
          <p className="text-body-md text-white/50">
            The working record of the setting&rsquo;s development — prompts, seeds, and reference images
            that keep later panels on-model — will appear here once published from the admin panel.
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            {records.map(({ record, assets }) => (
              <article key={record.id} className="border-l-2 border-nhw-cyan/20 pl-4 flex flex-col gap-3">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <h3 className="text-body-lg text-white/90">
                    v{record.version} — {record.title}
                  </h3>
                  {record.status === 'current' && (
                    <span className="text-label-sm text-nhw-amber/80 uppercase tracking-widest">current</span>
                  )}
                </div>
                {record.summary && <p className="text-body-md text-white/70">{record.summary}</p>}
                {(record.reference_image || assets.length > 0) && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {record.reference_image && (
                      <figure className="flex flex-col gap-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={record.reference_image}
                          alt={`${s.name} reference — v${record.version}`}
                          className="w-full aspect-square object-cover rounded-sm border border-nhw-cyan/20"
                        />
                        <figcaption className="text-label-sm text-nhw-cyan/50 uppercase tracking-widest">reference</figcaption>
                      </figure>
                    )}
                    {assets.map((a) => (
                      <figure key={a.id} className="flex flex-col gap-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={a.image_path}
                          alt={a.caption ?? `${s.name} ${a.kind}`}
                          className="w-full aspect-square object-cover rounded-sm border border-nhw-cyan/20"
                        />
                        <figcaption className="text-label-sm text-nhw-cyan/50 uppercase tracking-widest">
                          {a.caption ?? a.kind.replace('_', ' ')}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
