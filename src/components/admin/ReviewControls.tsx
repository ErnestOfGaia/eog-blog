'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { ContentAuthor, ContentStatus } from '@/types'
import { authorChip } from '@/components/admin/chips'
import { withBase } from '@/lib/paths'

interface Props {
  id: number
  currentStatus: ContentStatus
  reviewNotes: string | null
  author: ContentAuthor
  publishAt: string | null
}

const STATUS_LABELS: Record<ContentStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  changes_requested: 'Changes Requested',
  approved: 'Approved (scheduled)',
  published: 'Published',
}

const STATUS_COLORS: Record<ContentStatus, string> = {
  draft: 'bg-stone-100 text-stone-700',
  pending_review: 'bg-amber-100 text-amber-800',
  changes_requested: 'bg-red-100 text-red-800',
  approved: 'bg-green-100 text-green-800',
  published: 'bg-emerald-100 text-emerald-800',
}

function formatSlot(iso: string | null): string | null {
  if (!iso) return null
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function ReviewControls({ id, currentStatus, reviewNotes, author, publishAt }: Props) {
  const router = useRouter()
  const [localStatus, setLocalStatus] = useState<ContentStatus>(currentStatus)
  const [localNotes, setLocalNotes] = useState<string | null>(reviewNotes)
  const [localPublishAt, setLocalPublishAt] = useState<string | null>(publishAt)
  const [showNotesInput, setShowNotesInput] = useState(false)
  const [notesInput, setNotesInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { setLocalStatus(currentStatus) }, [currentStatus])
  useEffect(() => { setLocalNotes(reviewNotes) }, [reviewNotes])
  useEffect(() => { setLocalPublishAt(publishAt) }, [publishAt])

  async function transition(to: ContentStatus, notes?: string) {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(withBase(`/api/content/${id}/transition`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: to, review_notes: notes ?? null }),
      })
      if (res.ok) {
        const row = (await res.json()) as { status: ContentStatus; publish_at: string | null }
        setLocalStatus(row.status)
        setLocalPublishAt(row.publish_at)
        setLocalNotes(notes ?? localNotes)
        setShowNotesInput(false)
        setNotesInput('')
        router.refresh()
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? 'Transition failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const chip = authorChip(author)
  const slot = formatSlot(localPublishAt)

  return (
    <section className="mt-8 pt-6 border-t border-stone-200 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-stone-600">Status:</span>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[localStatus]}`}>
          {STATUS_LABELS[localStatus]}
        </span>
        <span className="text-stone-300 select-none">·</span>
        <span className="text-sm text-stone-500">Author:</span>
        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${chip.className}`}>
          {chip.label}
        </span>
      </div>

      {(localStatus === 'approved' || localStatus === 'published') && slot && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-900">
          <span className="font-medium">
            {localStatus === 'approved' ? 'Scheduled to publish:' : 'Published slot:'}
          </span>{' '}
          {slot} (Pacific)
        </div>
      )}

      {localNotes && localStatus === 'changes_requested' && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold mb-1">Changes requested:</p>
          <p className="whitespace-pre-wrap">{localNotes}</p>
        </div>
      )}

      <div className="flex flex-wrap items-start gap-3">
        {localStatus === 'draft' && (
          <button
            onClick={() => transition('pending_review')}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-eog-navy rounded-md hover:opacity-90 disabled:opacity-50"
          >
            Submit for review
          </button>
        )}

        {localStatus === 'pending_review' && (
          <>
            <button
              onClick={() => transition('approved')}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-800 disabled:opacity-50"
            >
              Approve &amp; schedule
            </button>
            <button
              onClick={() => setShowNotesInput((v) => !v)}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
            >
              Request changes
            </button>
          </>
        )}

        {localStatus === 'changes_requested' && (
          <button
            onClick={() => transition('pending_review')}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:opacity-50"
          >
            Resubmit for review
          </button>
        )}

        {localStatus === 'approved' && (
          <button
            onClick={() => transition('published')}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-700 rounded-md hover:bg-emerald-800 disabled:opacity-50"
          >
            Publish now
          </button>
        )}

        {localStatus === 'published' && (
          <button
            onClick={() => transition('draft')}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50"
          >
            Unpublish
          </button>
        )}
      </div>

      {showNotesInput && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700">
            Review notes <span className="text-red-500">*</span>
          </label>
          <textarea
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-white text-stone-900 placeholder:text-stone-400 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-eog-teal"
            placeholder="Describe what needs to change…"
          />
          <div className="flex gap-3">
            <button
              onClick={() => transition('changes_requested', notesInput)}
              disabled={submitting || !notesInput.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-red-700 rounded-md hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit request
            </button>
            <button
              onClick={() => { setShowNotesInput(false); setNotesInput('') }}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  )
}
