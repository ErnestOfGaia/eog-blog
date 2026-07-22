// Admin — single record editor + asset manager (D4).
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { getCharacterMeta, getRecord, getAssets } from '@/lib/character-records'
import { RecordDeleteButton } from '@/components/admin/RecordDeleteButton'

export const dynamic = 'force-dynamic'

const inputCls =
  'w-full px-3 py-2 bg-white text-stone-900 placeholder:text-stone-400 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-stone-500 focus:border-stone-500'

export default async function RecordEditorPage({
  params,
}: {
  params: Promise<{ slug: string; recordId: string }>
}) {
  await requireAdmin()
  const { slug, recordId } = await params
  const meta = getCharacterMeta(slug)
  const id = parseInt(recordId, 10)
  const rec = isNaN(id) ? undefined : getRecord(id)
  if (!meta || !rec || rec.character !== slug) notFound()

  const assets = getAssets(rec.id)

  return (
    <main className="p-6 min-h-screen bg-stone-50 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-stone-900">
          {meta.name} v{rec.version}
          <span className="ml-2 text-sm font-normal text-stone-500">{rec.status}{rec.is_public === 1 ? ' · public' : ''}</span>
        </h1>
        <Link href={`/admin/characters/${slug}`} className="text-sm font-medium text-stone-600 hover:text-stone-900">
          &larr; {meta.name} versions
        </Link>
      </div>

      {/* Edit fields */}
      <section className="bg-white border border-stone-200 rounded-lg p-5 mb-8">
        <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-4">Record fields</h2>
        <form action={`/api/character-records/${rec.id}`} method="POST" className="space-y-4">
          <input type="hidden" name="action" value="update" />
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-stone-700 mb-1">Title *</label>
            <input id="title" name="title" required defaultValue={rec.title} className={inputCls} />
          </div>
          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-stone-700 mb-1">Summary</label>
            <textarea id="summary" name="summary" rows={2} defaultValue={rec.summary ?? ''} className={inputCls} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="tool" className="block text-sm font-medium text-stone-700 mb-1">Tool</label>
              <input id="tool" name="tool" defaultValue={rec.tool ?? ''} className={inputCls} />
            </div>
            <div>
              <label htmlFor="seed" className="block text-sm font-medium text-stone-700 mb-1">Seed</label>
              <input id="seed" name="seed" defaultValue={rec.seed ?? ''} className={inputCls} />
            </div>
            <div>
              <label htmlFor="reference_image" className="block text-sm font-medium text-stone-700 mb-1">Reference image path</label>
              <input id="reference_image" name="reference_image" defaultValue={rec.reference_image ?? ''} className={inputCls} placeholder={meta.defaultImage} />
            </div>
          </div>
          <div>
            <label htmlFor="prompt_full" className="block text-sm font-medium text-stone-700 mb-1">Full prompt</label>
            <textarea id="prompt_full" name="prompt_full" rows={4} defaultValue={rec.prompt_full ?? ''} className={`${inputCls} font-mono text-sm`} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="style_block" className="block text-sm font-medium text-stone-700 mb-1">Style block</label>
              <textarea id="style_block" name="style_block" rows={3} defaultValue={rec.style_block ?? ''} className={`${inputCls} font-mono text-sm`} />
            </div>
            <div>
              <label htmlFor="negative_block" className="block text-sm font-medium text-stone-700 mb-1">Negative block</label>
              <textarea id="negative_block" name="negative_block" rows={3} defaultValue={rec.negative_block ?? ''} className={`${inputCls} font-mono text-sm`} />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-stone-200">
            <div className="flex gap-4">
              {rec.status !== 'current' && (
                <button form="setcurrent" type="submit" className="text-sm font-medium text-green-700 hover:text-green-900">Make current</button>
              )}
            </div>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-stone-900 rounded-md hover:bg-stone-800">Save</button>
          </div>
        </form>
        {/* sibling forms for status actions (kept out of the edit form to avoid nesting) */}
        <form id="setcurrent" action={`/api/character-records/${rec.id}`} method="POST" className="hidden">
          <input type="hidden" name="action" value="set_current" />
        </form>
      </section>

      {/* Assets */}
      <section className="bg-white border border-stone-200 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-4">
          Assets ({assets.length})
        </h2>

        {assets.length > 0 && (
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {assets.map((a) => (
              <li key={a.id} className="border border-stone-200 rounded-md overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image_path} alt={a.caption ?? a.kind} className="w-full h-32 object-cover bg-stone-100" />
                <div className="p-2">
                  <p className="text-xs font-medium text-stone-700">{a.kind}{a.is_public === 1 ? ' · public' : ''}</p>
                  {a.caption && <p className="text-xs text-stone-500 truncate">{a.caption}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <form action={`/api/character-records/assets/${a.id}`} method="POST">
                      <input type="hidden" name="action" value="toggle_public" />
                      <button type="submit" className="text-xs font-medium text-blue-700 hover:text-blue-900">
                        {a.is_public === 1 ? 'Unpublish' : 'Make public'}
                      </button>
                    </form>
                    <RecordDeleteButton
                      endpoint={`/api/character-records/assets/${a.id}`}
                      label="Delete"
                      confirmText="Delete this asset?"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <h3 className="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-3">Upload asset</h3>
        <form
          action={`/api/character-records/${rec.id}/assets`}
          method="POST"
          encType="multipart/form-data"
          className="space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-stone-700 mb-1">Image (png/jpg/webp/gif, ≤10MB) *</label>
              <input id="file" name="file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" required className="text-sm text-stone-700" />
            </div>
            <div>
              <label htmlFor="kind" className="block text-sm font-medium text-stone-700 mb-1">Kind</label>
              <select id="kind" name="kind" defaultValue="reference" className={inputCls}>
                <option value="reference">Reference</option>
                <option value="test_panel">Test panel</option>
                <option value="drift_example">Drift example</option>
                <option value="approved_panel">Approved panel</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="caption" className="block text-sm font-medium text-stone-700 mb-1">Caption</label>
            <input id="caption" name="caption" className={inputCls} placeholder="What this shows" />
          </div>
          <div>
            <label htmlFor="checklist_result" className="block text-sm font-medium text-stone-700 mb-1">
              Checklist result <span className="font-normal text-stone-400">(SOP §10 — JSON or notes)</span>
            </label>
            <textarea id="checklist_result" name="checklist_result" rows={2} className={`${inputCls} font-mono text-sm`} />
          </div>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" name="is_public" /> Show in public curated view
          </label>
          <div className="flex justify-end pt-2 border-t border-stone-200">
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-stone-900 rounded-md hover:bg-stone-800">Upload</button>
          </div>
        </form>
      </section>
    </main>
  )
}
