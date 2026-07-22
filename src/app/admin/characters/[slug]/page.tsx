// Admin — records for one character (D4): list versions with actions + a "new version" form.
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { getCharacterMeta, getRecordsByCharacter, getAssets } from '@/lib/character-records'
import { RecordDeleteButton } from '@/components/admin/RecordDeleteButton'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const inputCls =
  'w-full px-3 py-2 bg-white text-stone-900 placeholder:text-stone-400 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-stone-500 focus:border-stone-500'

export default async function CharacterRecordsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  await requireAdmin()
  const { slug } = await params
  const meta = getCharacterMeta(slug)
  if (!meta) notFound()

  const records = getRecordsByCharacter(slug)
  const assetCounts = new Map(records.map((r) => [r.id, getAssets(r.id).length]))

  return (
    <main className="p-6 min-h-screen bg-stone-50 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-stone-900">
          {meta.name} <span className="text-base font-normal text-stone-500">· {meta.pronouns}</span>
        </h1>
        <Link href="/admin/characters" className="text-sm font-medium text-stone-600 hover:text-stone-900">
          &larr; All characters
        </Link>
      </div>
      <p className="text-sm text-stone-500 mb-8">{meta.role}</p>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-3">
          Versions ({records.length})
        </h2>
        {records.length === 0 ? (
          <p className="text-sm text-stone-400">No records yet — create the first version below.</p>
        ) : (
          <ul className="space-y-3">
            {records.map((r) => (
              <li key={r.id} className="bg-white border border-stone-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900">v{r.version} — {r.title}</span>
                      {r.status === 'current' && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">current</span>
                      )}
                      {r.status === 'superseded' && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">superseded</span>
                      )}
                      {r.is_public === 1 && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">public</span>
                      )}
                    </div>
                    {r.summary && <p className="text-sm text-stone-500 mt-1">{r.summary}</p>}
                    <p className="text-xs text-stone-400 mt-1">
                      {assetCounts.get(r.id) ?? 0} asset(s) · {r.tool ?? 'no tool'} · seed {r.seed ?? '—'} · updated {formatDate(r.updated_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Link
                      href={`/admin/characters/${slug}/${r.id}`}
                      className="text-xs font-medium text-stone-700 hover:text-stone-900 underline"
                    >
                      Edit
                    </Link>
                    {r.status !== 'current' && (
                      <form action={`/api/character-records/${r.id}`} method="POST">
                        <input type="hidden" name="action" value="set_current" />
                        <button type="submit" className="text-xs font-medium text-green-700 hover:text-green-900">
                          Make current
                        </button>
                      </form>
                    )}
                    <form action={`/api/character-records/${r.id}`} method="POST">
                      <input type="hidden" name="action" value="toggle_public" />
                      <button type="submit" className="text-xs font-medium text-blue-700 hover:text-blue-900">
                        {r.is_public === 1 ? 'Unpublish' : 'Make public'}
                      </button>
                    </form>
                    <RecordDeleteButton
                      endpoint={`/api/character-records/${r.id}`}
                      confirmText={`Delete ${meta.name} v${r.version} and its assets?`}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white border border-stone-200 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-4">New version</h2>
        <form action="/api/character-records" method="POST" className="space-y-4">
          <input type="hidden" name="character" value={slug} />
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-stone-700 mb-1">Title *</label>
            <input id="title" name="title" required className={inputCls} placeholder={`e.g. ${meta.name} v1 — base model`} />
          </div>
          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-stone-700 mb-1">Summary</label>
            <textarea id="summary" name="summary" rows={2} className={inputCls} placeholder="What this version is / what changed" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="tool" className="block text-sm font-medium text-stone-700 mb-1">Tool</label>
              <input id="tool" name="tool" className={inputCls} placeholder="google-ai/imagen" />
            </div>
            <div>
              <label htmlFor="seed" className="block text-sm font-medium text-stone-700 mb-1">Seed</label>
              <input id="seed" name="seed" className={inputCls} placeholder="or 'no seed exposed'" />
            </div>
            <div>
              <label htmlFor="reference_image" className="block text-sm font-medium text-stone-700 mb-1">Reference image path</label>
              <input id="reference_image" name="reference_image" className={inputCls} placeholder={meta.defaultImage} />
            </div>
          </div>
          <div>
            <label htmlFor="prompt_full" className="block text-sm font-medium text-stone-700 mb-1">Full prompt (SOP §4)</label>
            <textarea id="prompt_full" name="prompt_full" rows={4} className={`${inputCls} font-mono text-sm`} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="style_block" className="block text-sm font-medium text-stone-700 mb-1">Style block</label>
              <textarea id="style_block" name="style_block" rows={3} className={`${inputCls} font-mono text-sm`} />
            </div>
            <div>
              <label htmlFor="negative_block" className="block text-sm font-medium text-stone-700 mb-1">Negative block</label>
              <textarea id="negative_block" name="negative_block" rows={3} className={`${inputCls} font-mono text-sm`} />
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-stone-200">
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-stone-900 rounded-md hover:bg-stone-800">
              Create version
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
