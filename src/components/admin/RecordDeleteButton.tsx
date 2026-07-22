'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Small client button for DELETE (HTML forms can't issue DELETE). Used for both
// records and assets via the `endpoint` prop.
export function RecordDeleteButton({
  endpoint,
  label = 'Delete',
  confirmText = 'Delete this permanently?',
  redirectTo,
}: {
  endpoint: string
  label?: string
  confirmText?: string
  redirectTo?: string
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function onClick() {
    if (!window.confirm(confirmText)) return
    setBusy(true)
    try {
      const res = await fetch(endpoint, { method: 'DELETE' })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        window.alert(j.error ?? 'Delete failed')
        setBusy(false)
        return
      }
      if (redirectTo) router.push(redirectTo)
      else router.refresh()
    } catch {
      window.alert('Delete failed')
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {busy ? '…' : label}
    </button>
  )
}
