'use client'

// Editor "Preview in HTML" control — renders the *current* editor content exactly
// as it appears on the public site, without publishing. It reuses the public
// renderers (MarkdownRenderer for posts/articles, ComicStripViewer for comics) so
// what an editor sees here matches what a reader gets. Works for UNPUBLISHED drafts
// (it reads the live form fields + the row's comic_panels — it never links out to
// /articles/[slug] or /dispatch/..., which 404 until the item is live).
//
// Publishing semantics are untouched: this is a non-submit, read-only preview.
// Status changes still happen only through ReviewControls.

import { useState } from 'react'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer'
import ComicStripViewer from '@/components/ui/ComicStripViewer'
import type { ContentTier, ContentType } from '@/types'

interface PanelObject {
  image: string
  caption?: string
  alt?: string
}

// Mirrors parsePanels() in src/app/articles/[slug]/page.tsx (both panel shapes).
function parsePanels(raw: string | null): PanelObject[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) => {
        if (typeof item === 'string') return { image: item }
        if (
          typeof item === 'object' &&
          item !== null &&
          typeof (item as Record<string, unknown>).image === 'string'
        ) {
          return item as PanelObject
        }
        return null
      })
      .filter((p): p is PanelObject => p !== null)
  } catch {
    return []
  }
}

// Mirrors renderBodyWithPanels() in the public article page: inline [PANEL n] markers.
function renderBodyWithPanels(body: string, panels: PanelObject[]): React.ReactNode[] {
  const parts = body.split(/\[PANEL\s+(\d+)\]/gi)
  const result: React.ReactNode[] = []

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      if (parts[i]) {
        result.push(<MarkdownRenderer key={`text-${i}`} content={parts[i]} />)
      }
    } else {
      const panelIndex = parseInt(parts[i]) - 1
      const panel = panels[panelIndex]
      if (panel) {
        result.push(
          <figure key={`panel-${i}`} className="my-8 mx-auto max-w-2xl">
            <img
              src={panel.image}
              alt={panel.alt ?? `Panel ${panelIndex + 1}`}
              className="w-full rounded-sm"
            />
            {panel.caption && (
              <figcaption className="mt-2 text-sm text-stone-500 text-center italic">
                {panel.caption}
              </figcaption>
            )}
          </figure>
        )
      } else {
        result.push(
          <p key={`panel-missing-${i}`} className="text-stone-400 text-sm italic my-4">
            [Panel {panelIndex + 1} not found]
          </p>
        )
      }
    }
  }

  return result
}

// Live snapshot of the editor form, captured at click time so the preview reflects
// unsaved edits.
interface Snapshot {
  title: string
  body: string
  type: ContentType
  tier: ContentTier
  series: string
  character: string
  audience: string
  subject: string
}

function fieldValue(id: string): string {
  const el = document.getElementById(id) as
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement
    | null
  return el?.value ?? ''
}

interface Props {
  // Raw comic_panels JSON from the DB row (panels are not editable in this form,
  // so the stored value is authoritative for the preview).
  comicPanels: string | null
}

export function PreviewButton({ comicPanels }: Props) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)

  function openPreview() {
    setSnapshot({
      title: fieldValue('title'),
      body: fieldValue('body'),
      type: (fieldValue('type') || 'post') as ContentType,
      tier: (fieldValue('tier') || 'free') as ContentTier,
      series: fieldValue('series'),
      character: fieldValue('character'),
      audience: fieldValue('audience_in_fiction'),
      subject: fieldValue('subject'),
    })
  }

  function close() {
    setSnapshot(null)
  }

  const panels = parsePanels(comicPanels)

  return (
    <>
      <button
        type="button"
        onClick={openPreview}
        className="px-4 py-2 text-sm font-medium text-white bg-stone-900 border border-transparent rounded-md shadow-sm hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900"
      >
        Preview in HTML
      </button>

      {snapshot &&
        (snapshot.type === 'comic' ? (
          <ComicStripViewer
            panels={panels}
            tier={snapshot.tier}
            title={snapshot.title}
            onClose={close}
          />
        ) : (
          <ArticlePreview snapshot={snapshot} panels={panels} onClose={close} />
        ))}
    </>
  )
}

// Dark, public-styled overlay mirroring the /articles/[slug] layout so a draft
// looks exactly as it will once live.
function ArticlePreview({
  snapshot,
  panels,
  onClose,
}: {
  snapshot: Snapshot
  panels: PanelObject[]
  onClose: () => void
}) {
  const hasPanels = panels.length > 0
  const hasMarkers = /\[PANEL\s+\d+\]/i.test(snapshot.body)

  const bylineParts: string[] = []
  if (snapshot.character) {
    const narratorLabel = snapshot.character.charAt(0).toUpperCase() + snapshot.character.slice(1)
    let line = `Filed by ${narratorLabel}`
    if (snapshot.audience) {
      const audienceLabel = snapshot.audience.charAt(0).toUpperCase() + snapshot.audience.slice(1)
      line += ` to ${audienceLabel}`
    }
    bylineParts.push(line)
  }
  if (snapshot.subject) bylineParts.push(`Subject: ${snapshot.subject}`)
  const byline = bylineParts.join('. ')

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-nhw-bg"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview: ${snapshot.title}`}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-nhw-cyan/30 bg-nhw-bg/90 px-4 py-3 backdrop-blur">
        <span className="text-label-sm uppercase tracking-widest text-nhw-cyan/70">
          Preview — not published
        </span>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] text-xl text-nhw-cyan transition-opacity hover:opacity-70"
          aria-label="Close preview"
        >
          ✕
        </button>
      </div>

      <main className="mx-auto max-w-prose space-y-8 px-4 py-12">
        <article className="space-y-6">
          <header className="space-y-2">
            {snapshot.series && (
              <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
                {snapshot.series.replace('-', ' ')}
              </span>
            )}
            <h1 className="font-serif text-4xl font-bold leading-tight text-stone-100">
              {snapshot.title || '(untitled)'}
            </h1>
            {byline && <p className="text-sm italic text-stone-400">{byline}.</p>}
          </header>

          {hasPanels && hasMarkers ? (
            <div className="space-y-0">{renderBodyWithPanels(snapshot.body, panels)}</div>
          ) : (
            <MarkdownRenderer content={snapshot.body} />
          )}
        </article>
      </main>
    </div>
  )
}
