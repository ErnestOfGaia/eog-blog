import Link from 'next/link'
import { getDb } from '@/lib/db'
import { Content } from '@/types'
import { notFound } from 'next/navigation'
import { ReviewControls } from '@/components/admin/ReviewControls'
import { DeleteContentButton } from '@/components/admin/DeleteContentButton'
import { PreviewButton } from '@/components/admin/PreviewButton'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { parseTags } from '@/lib/utils'
import { runContentGuard } from '@/lib/content-guard'
import { withBase } from '@/lib/paths'

const inputCls =
  'w-full px-3 py-2 bg-white text-stone-900 placeholder:text-stone-400 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-eog-teal focus:border-eog-teal'

export const dynamic = 'force-dynamic'

export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id)
  if (isNaN(id)) notFound()

  const db = getDb()
  const item = db.prepare('SELECT * FROM content WHERE id = ?').get(id) as Content | undefined
  if (!item) notFound()

  // Advisory content-guard lint, surfaced for the reviewer.
  const guard = runContentGuard({ title: item.title, body: item.body, excerpt: item.excerpt })

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-eog-navy">Edit Post</h1>
        <Link href="/admin" className="text-sm font-medium text-stone-600 hover:text-eog-navy transition-colors">
          &larr; Back to Board
        </Link>
      </div>

      {!guard.ok && (
        <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold mb-1">Content-guard flags ({guard.findings.length}):</p>
          <ul className="list-disc pl-5 space-y-0.5">
            {guard.findings.map((f, i) => (
              <li key={i}>{f.message}</li>
            ))}
          </ul>
        </div>
      )}

      <form action={withBase(`/api/content/${id}`)} method="POST" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">Slug</label>
            <p className="text-stone-500 text-sm font-mono bg-stone-50 px-3 py-2 border border-stone-200 rounded-md">
              /blog/{item.slug}
            </p>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-stone-700 mb-1">Title *</label>
            <input type="text" id="title" name="title" required defaultValue={item.title} className={inputCls} />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="excerpt" className="block text-sm font-medium text-stone-700 mb-1">Excerpt</label>
            <textarea id="excerpt" name="excerpt" rows={2} defaultValue={item.excerpt ?? ''} className={inputCls} />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-stone-700 mb-1">Tags</label>
            <input type="text" id="tags" name="tags" defaultValue={parseTags(item.tags).join(', ')} className={inputCls} placeholder="comma, separated" />
          </div>

          <div>
            <label htmlFor="discuss_linkedin_url" className="block text-sm font-medium text-stone-700 mb-1">Discuss on LinkedIn (URL)</label>
            <input type="url" id="discuss_linkedin_url" name="discuss_linkedin_url" defaultValue={item.discuss_linkedin_url ?? ''} className={inputCls} />
          </div>

          <div>
            <label htmlFor="cover_image" className="block text-sm font-medium text-stone-700 mb-1">Cover image (URL/path)</label>
            <input type="text" id="cover_image" name="cover_image" defaultValue={item.cover_image ?? ''} className={inputCls} />
          </div>

          <div>
            <label htmlFor="cover_image_alt" className="block text-sm font-medium text-stone-700 mb-1">Cover image alt text</label>
            <input type="text" id="cover_image_alt" name="cover_image_alt" defaultValue={item.cover_image_alt ?? ''} className={inputCls} />
          </div>

          <div>
            <label htmlFor="seo_title" className="block text-sm font-medium text-stone-700 mb-1">SEO title</label>
            <input type="text" id="seo_title" name="seo_title" defaultValue={item.seo_title ?? ''} className={inputCls} />
          </div>

          <div>
            <label htmlFor="canonical_url" className="block text-sm font-medium text-stone-700 mb-1">Canonical URL <span className="font-normal text-stone-400">(blank = self)</span></label>
            <input type="url" id="canonical_url" name="canonical_url" defaultValue={item.canonical_url ?? ''} className={inputCls} />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="seo_description" className="block text-sm font-medium text-stone-700 mb-1">SEO description</label>
            <textarea id="seo_description" name="seo_description" rows={2} defaultValue={item.seo_description ?? ''} className={inputCls} />
          </div>

          <ImageUploader />

          <div className="md:col-span-2">
            <label htmlFor="body" className="block text-sm font-medium text-stone-700 mb-1">Body * (Markdown)</label>
            <textarea id="body" name="body" required rows={20} defaultValue={item.body} className={`${inputCls} font-mono text-sm`} />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          <DeleteContentButton id={item.id} title={item.title} />
          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-md shadow-sm hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-eog-teal"
            >
              Save
            </button>
            <PreviewButton />
          </div>
        </div>
      </form>

      <ReviewControls
        id={item.id}
        currentStatus={item.status}
        reviewNotes={item.review_notes}
        author={item.author}
        publishAt={item.publish_at}
      />

      <div className="mt-10 pt-6 border-t border-stone-200">
        <Link href="/admin" className="inline-flex items-center text-sm font-medium text-stone-600 hover:text-eog-navy transition-colors">
          &larr; Return to Board
        </Link>
      </div>
    </main>
  )
}
