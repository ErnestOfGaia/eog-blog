'use client'

// Upload an image → stored on the volume → returns /blog/media/<file>. Then set it
// as the cover, or insert a markdown image into the body. Writes directly to the
// (uncontrolled) editor fields by id, matching PreviewButton's approach.

import { useState } from 'react'
import { withBase } from '@/lib/paths'

export function ImageUploader() {
  const [busy, setBusy] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError(null)
    setUrl(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(withBase('/api/media/upload'), { method: 'POST', body: fd })
      if (res.ok) {
        const d = (await res.json()) as { url: string }
        setUrl(d.url)
      } else {
        const d = (await res.json().catch(() => ({}))) as { error?: string }
        setError(d.error ?? 'Upload failed')
      }
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  function setCover() {
    if (!url) return
    const el = document.getElementById('cover_image') as HTMLInputElement | null
    if (el) el.value = url
  }

  function insertBody() {
    if (!url) return
    const el = document.getElementById('body') as HTMLTextAreaElement | null
    if (el) el.value = `${el.value}\n\n![](${url})\n`
  }

  return (
    <div className="md:col-span-2 rounded-md border border-stone-200 bg-stone-50 p-4 space-y-3">
      <label className="block text-sm font-medium text-stone-700">Upload image</label>
      <input
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        onChange={onFile}
        disabled={busy}
        className="block text-sm text-stone-700 file:mr-3 file:rounded-md file:border-0 file:bg-eog-navy file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:opacity-90"
      />
      {busy && <p className="text-sm text-stone-500">Uploading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {url && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="upload preview" className="h-16 w-16 rounded object-cover border border-stone-200" />
            <code className="text-xs text-stone-500 break-all">{url}</code>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={setCover} className="px-3 py-1.5 text-sm font-medium text-white bg-eog-teal rounded-md hover:opacity-90">
              Use as cover
            </button>
            <button type="button" onClick={insertBody} className="px-3 py-1.5 text-sm font-medium text-eog-navy bg-white border border-stone-300 rounded-md hover:bg-stone-50">
              Insert into body
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
