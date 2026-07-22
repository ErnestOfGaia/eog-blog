import type { Metadata } from 'next'
import Link from 'next/link'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

const LORE_DESCRIPTION =
  'The world of the Coastal Command Center — its signal station and the characters who resolve out of the noise.'

export const metadata: Metadata = {
  title: 'World Lore — News Hub World',
  description: LORE_DESCRIPTION,
  openGraph: {
    title: 'World Lore — News Hub World',
    description: LORE_DESCRIPTION,
    type: 'website',
    images: [{ url: '/lore/header.png', width: 1200, height: 630, alt: 'World Lore — News Hub World' }],
  },
}

// Lore page progressive reveal: starts with the setting (Coastal Command Center)
// and fills back in with character cards as Beacon, Static, and zClaude resolve in-world.

type SceneEntry = {
  name: string
  role: string
  image: string
  href: string
  description: string
}

const ACTIVE_SCENES: SceneEntry[] = [
  {
    name: 'Coastal Command Center',
    role: 'Signal Station — Location',
    image: '/lore/header.png',
    href: '/scene/command-center',
    description:
      'A maritime-industrial signal station on a sea cliff. Driftwood beams, rusted antenna struts, and a command window holding a single honest signal against the noise.',
  },
]

export default function LorePage() {
  const db = getDb()
  const isBeaconResolved = db
    .prepare("SELECT 1 FROM content WHERE slug = 'the-first-clear-signal' AND status = 'published' LIMIT 1")
    .get() !== undefined
  const isStaticResolved = db
    .prepare("SELECT 1 FROM content WHERE slug = 'noise-on-the-line' AND status = 'published' LIMIT 1")
    .get() !== undefined

  const activeScenes = [...ACTIVE_SCENES]
  if (isBeaconResolved) {
    activeScenes.push({
      name: 'Beacon',
      role: 'Signal Keeper — Character',
      image: '/lore/beacon.png',
      href: '/character/beacon',
      description:
        'The Signal Keeper, a coastal pelican who resolves out of the analog static to keep the lighthouse beam steady and monitor the data horizon. She doesn’t arrive; she comes into focus.',
    })
  }
  if (isStaticResolved) {
    activeScenes.push({
      name: 'Static',
      role: 'Noise Correspondent — Character',
      image: '/lore/static.png',
      href: '/character/static',
      description:
        'The Noise Correspondent, a coastal seagull who blows in out of the static itself — windswept and in motion, the opposite of Beacon’s stillness. She narrates the Build Log, reporting to Beacon.',
    })
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10">
      {/* Banner header (Home Banner art) */}
      <header className="relative w-full h-48 md:h-64 overflow-hidden border border-nhw-cyan/30 rounded-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lore/header.png"
          alt="The Coastal Command Center"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-nhw-bg via-nhw-bg/40 to-transparent" />
        <h1 className="absolute bottom-0 left-0 p-6 text-headline-lg text-nhw-cyan uppercase drop-shadow-md">
          World Lore
        </h1>
      </header>

      <p className="text-body-md text-white/70">
        Welcome to the data horizon. News Hub World is a proof that drift can be prevented when building
        with AI tools. Here, the signal station and its crew render into existence out of the static, one
        pull request at a time. The world watches itself be built.
      </p>

      <section className="flex flex-col gap-6">
        <h2 className="text-label-lg text-nhw-cyan uppercase tracking-widest">
          ACTIVE SCENES ──────────── ((•))
        </h2>
        <div className="flex flex-col gap-6">
          {activeScenes.map((s) => (
            <Link
              key={s.name}
              href={s.href}
              className="flex gap-4 border-l-2 border-nhw-amber pl-4 hover:border-nhw-cyan transition-colors group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.image}
                alt={`${s.name} — ${s.role}`}
                className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-sm border border-nhw-cyan/20 shrink-0"
              />
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <h3 className="text-headline-md text-nhw-cyan uppercase group-hover:opacity-80 transition-opacity">
                    {s.name}
                  </h3>
                  <span className="text-label-sm text-nhw-amber/80 uppercase tracking-widest">
                    {s.role}
                  </span>
                </div>
                <p className="text-body-md text-white/70">{s.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <p className="text-label-sm text-nhw-cyan/40 border-t border-nhw-cyan/20 pt-6">
        Characters will appear on this board as they resolve out of the static and their becoming pages
        are published.
      </p>
    </main>
  )
}

