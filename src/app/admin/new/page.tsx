'use client'

import Link from 'next/link'
import { withBase } from '@/lib/paths'
import { ImageUploader } from '@/components/admin/ImageUploader'

const inputCls =
  'w-full px-3 py-2 bg-white text-stone-900 placeholder:text-stone-400 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-eog-teal focus:border-eog-teal'

export default function NewContentPage() {
  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-eog-navy">New Post</h1>
        <Link href="/admin" className="text-sm font-medium text-stone-600 hover:text-eog-navy transition-colors">
          &larr; Back to Board
        </Link>
      </div>

      <form action={withBase('/api/content')} method="POST" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-stone-700 mb-1">Title *</label>
            <input type="text" id="title" name="title" required className={inputCls} placeholder="e.g. What I learned automating my blog" />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="excerpt" className="block text-sm font-medium text-stone-700 mb-1">Excerpt</label>
            <textarea id="excerpt" name="excerpt" rows={2} className={inputCls} placeholder="One-line summary (optional — auto-derived if blank)" />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-stone-700 mb-1">Tags</label>
            <input type="text" id="tags" name="tags" className={inputCls} placeholder="comma, separated, tags" />
          </div>

          <div>
            <label htmlFor="discuss_linkedin_url" className="block text-sm font-medium text-stone-700 mb-1">Discuss on LinkedIn (URL)</label>
            <input type="url" id="discuss_linkedin_url" name="discuss_linkedin_url" className={inputCls} placeholder="https://linkedin.com/…" />
          </div>

          <div>
            <label htmlFor="cover_image" className="block text-sm font-medium text-stone-700 mb-1">Cover image (URL/path)</label>
            <input type="text" id="cover_image" name="cover_image" className={inputCls} placeholder="/media/… or https://…" />
          </div>

          <div>
            <label htmlFor="cover_image_alt" className="block text-sm font-medium text-stone-700 mb-1">Cover image alt text</label>
            <input type="text" id="cover_image_alt" name="cover_image_alt" className={inputCls} placeholder="Describe the image" />
          </div>

          <div>
            <label htmlFor="seo_title" className="block text-sm font-medium text-stone-700 mb-1">SEO title <span className="font-normal text-stone-400">(defaults to title)</span></label>
            <input type="text" id="seo_title" name="seo_title" className={inputCls} />
          </div>

          <div>
            <label htmlFor="canonical_url" className="block text-sm font-medium text-stone-700 mb-1">Canonical URL <span className="font-normal text-stone-400">(blank = self)</span></label>
            <input type="url" id="canonical_url" name="canonical_url" className={inputCls} />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="seo_description" className="block text-sm font-medium text-stone-700 mb-1">SEO description <span className="font-normal text-stone-400">(defaults to excerpt)</span></label>
            <textarea id="seo_description" name="seo_description" rows={2} className={inputCls} />
          </div>

          <ImageUploader />

          <div className="md:col-span-2">
            <label htmlFor="body" className="block text-sm font-medium text-stone-700 mb-1">Body * (Markdown)</label>
            <textarea id="body" name="body" required rows={20} className={`${inputCls} font-mono text-sm`} placeholder="Write in Markdown…" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-stone-200">
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-eog-navy border border-transparent rounded-md shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-eog-navy"
          >
            Create draft
          </button>
        </div>
      </form>
    </main>
  )
}
