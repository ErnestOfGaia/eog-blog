'use client'

// "Preview in HTML" — renders the current editor content with the public
// markdown renderer, without publishing. Reads live form fields so it reflects
// unsaved edits. Read-only; status changes still happen only via ReviewControls.

import { useState } from 'react'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer'

function fieldValue(id: string): string {
  const el = document.getElementById(id) as
    | HTMLInputElement
    | HTMLTextAreaElement
    | null
  return el?.value ?? ''
}

export function PreviewButton() {
  const [snapshot, setSnapshot] = useState<{ title: string; body: string } | null>(null)

  return (
    <>
      <button
        type="button"
        onClick={() => setSnapshot({ title: fieldValue('title'), body: fieldValue('body') })}
        className="px-4 py-2 text-sm font-medium text-white bg-eog-teal border border-transparent rounded-md shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-eog-teal"
      >
        Preview in HTML
      </button>

      {snapshot && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#f7f3e6]"
          role="dialog"
          aria-modal="true"
          aria-label={`Preview: ${snapshot.title}`}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-[#f7f3e6]/90 px-4 py-3 backdrop-blur">
            <span className="text-xs uppercase tracking-widest text-stone-500">
              Preview — not published
            </span>
            <button
              type="button"
              onClick={() => setSnapshot(null)}
              className="min-h-[44px] min-w-[44px] text-xl text-eog-navy transition-opacity hover:opacity-70"
              aria-label="Close preview"
            >
              ✕
            </button>
          </div>

          <main className="mx-auto max-w-prose px-4 py-12">
            <article>
              <h1 className="mb-6 text-4xl font-bold leading-tight text-eog-navy">
                {snapshot.title || '(untitled)'}
              </h1>
              <MarkdownRenderer content={snapshot.body} />
            </article>
          </main>
        </div>
      )}
    </>
  )
}
