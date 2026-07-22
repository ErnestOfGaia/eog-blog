// Admin — Character Development Records index (D4). Lists every character with its
// record count and which version is current. Light stone theme to match the editorial board.
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { CHARACTERS, getRecordsByCharacter } from '@/lib/character-records'

export const dynamic = 'force-dynamic'

export default async function CharactersAdminPage() {
  await requireAdmin()

  const rows = CHARACTERS.map((c) => {
    const records = getRecordsByCharacter(c.slug)
    const current = records.find((r) => r.status === 'current')
    const publicCount = records.filter((r) => r.is_public === 1).length
    return { ...c, count: records.length, current, publicCount }
  })

  return (
    <main className="p-6 min-h-screen bg-stone-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Character Development Records</h1>
        <Link href="/admin" className="text-sm font-medium text-stone-600 hover:text-stone-900">
          &larr; Editorial Board
        </Link>
      </div>

      <p className="text-sm text-stone-500 mb-6 max-w-2xl">
        The anti-drift store: per character, the versioned record of prompts, seed, tool, and
        reference/test images that keeps panel art on-model. Pronouns are canon-locked — see the
        Pronoun Ledger in <code className="text-stone-700">docs/panel-generation-sop.md</code>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((c) => (
          <Link
            key={c.slug}
            href={`/admin/characters/${c.slug}`}
            className="block bg-white border border-stone-200 rounded-lg p-4 hover:border-stone-400 transition-colors"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900">{c.name}</h2>
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                {c.pronouns}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">{c.role}</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-stone-600">
              <span>{c.count} version{c.count === 1 ? '' : 's'}</span>
              <span>·</span>
              <span>
                {c.current ? `current: v${c.current.version}` : 'no current'}
              </span>
              <span>·</span>
              <span>{c.publicCount} public</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
