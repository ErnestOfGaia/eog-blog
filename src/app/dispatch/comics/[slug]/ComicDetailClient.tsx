'use client'

// C3 — 2026-06-01: thin client wrapper that mounts ComicStripViewer immediately
// on the comic detail page. The viewer fills the screen; the back link lives in
// the viewer's header chrome (passed via backHref prop).

import { useRouter } from 'next/navigation'
import ComicStripViewer, { PanelData } from '@/components/ui/ComicStripViewer'

type Props = {
  title: string
  panels: PanelData[]
  tier: 'free' | 'premium'
}

export default function ComicDetailClient({ title, panels, tier }: Props) {
  const router = useRouter()

  return (
    <ComicStripViewer
      panels={panels}
      tier={tier}
      title={title}
      backHref="/dispatch/comics"
      onClose={() => router.push('/dispatch/comics')}
    />
  )
}
