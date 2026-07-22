'use client'

// Ticket 6 — 2026-05-28: ComicStripViewer accepts both:
//   Legacy shape: panels = string[]   (image paths, no captions)
//   New shape:    panels = PanelObject[] ({ image, caption?, alt? })
// When given the legacy shape, panels display with no captions/alt (graceful degradation).
//
// C4 — 2026-06-01: Phone-first overhaul:
//   - Touch swipe left/right to page (50px threshold)
//   - Tap zones: left-third = prev, right-third = next
//   - Swipe hint shown for 2s on first open (localStorage-gated)
//   - Body scroll locked while open (restored on unmount)
//   - safe-area-inset padding (notch/home-bar support)
//   - Nav buttons ≥ 44px tap targets
//   - Panel fills width on phone (no horizontal padding on small screens)
//   - title + backHref props for in-viewer chrome back link (C3 integration)

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

export interface PanelObject {
  image: string
  caption?: string
  alt?: string
}

export type PanelData = string | PanelObject

function normalizePanel(p: PanelData): PanelObject {
  if (typeof p === 'string') return { image: p }
  return p
}

export type ComicStripViewerProps = {
  panels: PanelData[]
  initialPage?: number
  // tier is accepted for future Phase 2 use; only free panel view is rendered in Phase 1
  tier: 'free' | 'premium'
  onClose: () => void
  // Optional: title and back link shown in the viewer header (used by ComicDetailClient)
  title?: string
  backHref?: string
}

const HINT_KEY = 'nhw_comic_swipe_hint_seen'

export default function ComicStripViewer({
  panels,
  initialPage = 0,
  onClose,
  title,
  backHref,
}: ComicStripViewerProps) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [showHint, setShowHint] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Touch swipe state
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const goNext = useCallback(() => {
    setCurrentPage((p) => Math.min(p + 1, panels.length - 1))
  }, [panels.length])

  const goPrev = useCallback(() => {
    setCurrentPage((p) => Math.max(p - 1, 0))
  }, [])

  // Body scroll lock + hint on mount
  useEffect(() => {
    // Lock scroll
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Swipe hint: show once, hide after 2s
    if (panels.length > 1) {
      try {
        if (!localStorage.getItem(HINT_KEY)) {
          setShowHint(true)
          const t = setTimeout(() => {
            setShowHint(false)
            localStorage.setItem(HINT_KEY, '1')
          }, 2000)
          return () => {
            clearTimeout(t)
            document.body.style.overflow = originalOverflow
          }
        }
      } catch {
        // localStorage unavailable (private browsing) — skip hint
      }
    }

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [panels.length])

  // Keyboard navigation + focus trap
  useEffect(() => {
    closeButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight') {
        goNext()
      } else if (e.key === 'ArrowLeft') {
        goPrev()
      } else if (e.key === 'Tab') {
        const overlay = overlayRef.current
        if (!overlay) return
        const focusable = overlay.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])'
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, goNext, goPrev])

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    // Only trigger if horizontal movement dominates (not a scroll)
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) goNext()
      else goPrev()
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  const isFirst = currentPage === 0
  const isLast = currentPage === panels.length - 1

  if (!panels || panels.length === 0) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-nhw-bg"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        role="dialog"
        aria-modal="true"
      >
        <p className="text-nhw-cyan text-label-lg tracking-widest uppercase mb-4">
          NO_PANELS_CONFIGURED
        </p>
        <button
          type="button"
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 text-nhw-cyan text-xl min-h-[44px] min-w-[44px] flex items-center justify-center hover:opacity-70 transition-opacity"
          aria-label="Close viewer"
        >
          ✕
        </button>
      </div>
    )
  }

  const panel = normalizePanel(panels[currentPage])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex flex-col bg-nhw-bg overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      role="dialog"
      aria-modal="true"
      aria-label={title ? `Comic viewer: ${title}` : 'Comic Strip Viewer'}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header: back link (left) + close button (right) */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0">
        {backHref ? (
          <Link
            href={backHref}
            onClick={onClose}
            className="text-label-sm text-nhw-cyan/70 hover:text-nhw-cyan uppercase tracking-widest transition-colors min-h-[44px] flex items-center pr-4"
          >
            ← ARCHIVE
          </Link>
        ) : (
          <div />
        )}
        <button
          type="button"
          ref={closeButtonRef}
          onClick={onClose}
          className="text-nhw-cyan text-xl min-h-[44px] min-w-[44px] flex items-center justify-center hover:opacity-70 transition-opacity"
          aria-label="Close viewer"
        >
          ✕
        </button>
      </div>

      {/* Panel image — fills available width on phone, constrained on desktop */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden sm:px-16 sm:py-4"
      >
        <img
          src={panel.image}
          alt={panel.alt ?? `Comic page ${currentPage + 1} of ${panels.length}`}
          className="max-h-full w-full sm:max-w-full object-contain"
          draggable={false}
        />

        {/* Tap zones (left-third = prev, right-third = next) — transparent overlays */}
        {!isFirst && (
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-0 top-0 h-full w-1/3 cursor-pointer focus:outline-none"
            aria-label="Previous page"
            tabIndex={-1}
          />
        )}
        {!isLast && (
          <button
            type="button"
            onClick={goNext}
            className="absolute right-0 top-0 h-full w-1/3 cursor-pointer focus:outline-none"
            aria-label="Next page"
            tabIndex={-1}
          />
        )}

        {/* Swipe hint — shown once on first open for 2s */}
        {showHint && (
          <div
            className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none"
            aria-hidden="true"
          >
            <span className="text-nhw-cyan/60 text-label-sm uppercase tracking-widest bg-nhw-bg/80 px-4 py-2 rounded-sm animate-pulse">
              ← swipe →
            </span>
          </div>
        )}
      </div>

      {/* Caption (new shape only — gracefully absent for legacy string shape) */}
      {panel.caption && (
        <p className="text-center text-nhw-cyan text-body-md px-6 sm:px-16 pb-2 shrink-0">
          {panel.caption}
        </p>
      )}

      {/* Navigation bar — 44px tap targets, thumb-reachable at the bottom */}
      <div className="flex items-center justify-between px-4 pb-4 shrink-0">
        <button
          type="button"
          onClick={goPrev}
          disabled={isFirst}
          className="text-nhw-cyan text-label-lg tracking-widest uppercase disabled:opacity-30 hover:opacity-70 transition-opacity min-h-[44px] min-w-[44px] flex items-center"
          aria-label="Previous page"
        >
          ← PREV
        </button>

        <span className="text-nhw-cyan text-label-lg tracking-widest uppercase">
          {currentPage + 1} / {panels.length}
        </span>

        <button
          type="button"
          onClick={goNext}
          disabled={isLast}
          className="text-nhw-cyan text-label-lg tracking-widest uppercase disabled:opacity-30 hover:opacity-70 transition-opacity min-h-[44px] min-w-[44px] flex items-center"
          aria-label="Next page"
        >
          NEXT →
        </button>
      </div>
    </div>
  )
}
