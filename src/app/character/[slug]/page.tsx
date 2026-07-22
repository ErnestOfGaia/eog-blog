import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPublicRecords, getPublicAssets } from '@/lib/character-records'

// Reads the Development Records store at request time so admin-published records
// appear immediately. CANON below stays hardcoded (it's locked canon, not user data).
export const dynamic = 'force-dynamic'

// Scene-character dossiers. These characters appear in the world but never
// narrate, so they get a /character/<slug> page (not a /dispatch). The page also
// hosts development records (versions, prompts, reference images, tests) — canon
// facts here double as the anti-drift reference for panel art. If a character
// ever starts publishing, it graduates to a /dispatch page.
type CharacterRecord = {
  name: string
  role: string
  pronouns: string
  image: string
  summary: string
  facts: { label: string; value: string }[]
}

const CHARACTERS: Record<string, CharacterRecord> = {
  static: {
    name: 'Static',
    role: 'Noise Correspondent — Build Log Narrator',
    pronouns: 'she/her',
    image: '/lore/static.png',
    summary:
      'The Noise Correspondent, a coastal seagull who blows in out of the analog static itself — windswept and in motion, the opposite of Beacon’s stillness. She narrates the Build Log, reporting to Beacon. She doesn’t arrive; she comes into focus.',
    facts: [
      { label: 'Type', value: 'Coastal seagull (seagull silhouette)' },
      { label: 'Publishing', value: 'Build Log narrator — reports to Beacon' },
      {
        label: 'Visual anchors (LOCKED)',
        value:
          'Windswept feathers · mischievous/knowing expression · dynamic posture (in motion) · energetic, expressive gestures',
      },
      {
        label: 'Consistency rule',
        value:
          'Windswept feathers + motion + energy in panel 1 → same throughout. Never suddenly calm or static mid-comic.',
      },
    ],
  },
  beacon: {
    name: 'Beacon',
    role: 'Signal Keeper — Scene Character',
    pronouns: 'she/her',
    image: '/lore/beacon.png',
    summary:
      'The Signal Keeper, a coastal pelican who resolves out of the analog static to keep the lighthouse beam steady and monitor the data horizon. She doesn’t arrive; she comes into focus.',
    facts: [
      { label: 'Type', value: 'Coastal pelican (pelican silhouette)' },
      { label: 'Publishing', value: 'Scene character only — never narrates (for now)' },
      {
        label: 'Visual anchors (LOCKED)',
        value:
          'Navy coat with brass buttons · calm, composed facial expression · grounded posture · professional bearing',
      },
      {
        label: 'Consistency rule',
        value:
          'Navy coat + brass buttons in panel 1 → same in every panel. Do not redesign.',
      },
    ],
  },
  ag: {
    name: 'A.G.',
    role: 'AntiGravity — Scene Character',
    pronouns: 'they/them',
    image: '/lore/ag.png',
    summary:
      'A mechanical hummingbird who appears in panels but never narrates a series. A.G. shows up when an antigravity / hovering / weightlessness metaphor lands — a cameo presence, not a voice. If A.G. ever graduates to a narrator, that is a deliberate canon decision with a voice profile written from scratch.',
    facts: [
      { label: 'Type', value: 'Mechanical hummingbird (engineered, not soft)' },
      { label: 'Publishing', value: 'Scene character only — never narrates' },
      {
        label: 'Visual anchors (LOCKED)',
        value:
          'Gravity-defying halo · internal CRT-blue glow · mechanical-hummingbird silhouette · motion blur in flight · precise mechanical detail',
      },
      {
        label: 'Consistency rule',
        value:
          'Halo + hummingbird silhouette in a panel = A.G. Do not redesign body shape, halo placement, or glow color mid-comic.',
      },
    ],
  },
  jules: {
    name: 'Jules',
    role: 'Young Seagull — Scene Character',
    pronouns: 'he/him',
    image: '/lore/jules.png',
    summary:
      'The real Google AI coding agent, fictionalized as a young seagull learning to build, debug, and ship. Readers watch Jules work through real problems — but Jules never tells his own story; Static or zClaude narrate about him, only within the Jules Experience series.',
    facts: [
      { label: 'Type', value: 'Young seagull — curious, persistent, hands-on' },
      { label: 'Publishing', value: 'Scene character only — never narrates' },
      { label: 'Narrated by', value: 'Static or zClaude (never first-person)' },
      { label: 'Appears in', value: 'The Jules Experience series only' },
    ],
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const c = CHARACTERS[slug]
  if (!c) return {}
  return { title: `${c.name} — Character`, description: c.summary }
}

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const c = CHARACTERS[slug]
  if (!c) notFound()

  // Curated public Development Records (is_public only) — never the prompt/seed/tool.
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
          src={c.image}
          alt={c.name}
          className="w-28 h-28 md:w-36 md:h-36 object-cover rounded-sm border border-nhw-cyan/20 shrink-0"
        />
        <div className="flex flex-col gap-2">
          <h1 className="text-headline-lg text-nhw-cyan uppercase">{c.name}</h1>
          <span className="text-label-sm text-nhw-amber/80 uppercase tracking-widest">
            {c.role} · {c.pronouns}
          </span>
          <p className="text-body-md text-white/70">{c.summary}</p>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-label-lg text-nhw-cyan uppercase tracking-widest">CANON</h2>
        <dl className="flex flex-col gap-3">
          {c.facts.map((f) => (
            <div key={f.label} className="border-l-2 border-nhw-cyan/20 pl-4">
              <dt className="text-label-sm text-nhw-cyan/60 uppercase tracking-widest">{f.label}</dt>
              <dd className="text-body-md text-white/70">{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-label-lg text-nhw-cyan uppercase tracking-widest">DEVELOPMENT RECORDS</h2>
        {records.length === 0 ? (
          <p className="text-body-md text-white/50">
            The working record of {c.name}&rsquo;s development — versions, reference images, and tests
            that keep panel art on-model — will appear here as it&rsquo;s published.
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
                          alt={`${c.name} reference — v${record.version}`}
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
                          alt={a.caption ?? `${c.name} ${a.kind}`}
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
