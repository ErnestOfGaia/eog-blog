// Character Development Records API (D2/D3) — upload an asset to a record.
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi, redirectTarget } from '@/lib/auth'
import { getRecord, getAssets, addAsset } from '@/lib/character-records'
import { saveCharacterAsset } from '@/lib/uploads'
import type { CharacterAssetKind } from '@/types'

const KINDS: CharacterAssetKind[] = ['reference', 'test_panel', 'drift_example', 'approved_panel']

// POST /api/character-records/[id]/assets — multipart form: file, kind, caption,
// checklist_result, is_public. Writes the image and inserts the asset row.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdminApi()
  if (unauth) return unauth

  const id = parseInt((await params).id, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const rec = getRecord(id)
  if (!rec) return NextResponse.json({ error: 'Record not found' }, { status: 404 })

  const data = await req.formData()
  const file = data.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const kindRaw = data.get('kind')?.toString() ?? 'reference'
  const kind = (KINDS.includes(kindRaw as CharacterAssetKind) ? kindRaw : 'reference') as CharacterAssetKind

  const index = getAssets(id).length + 1
  const saved = await saveCharacterAsset(file, rec.character, id, index)
  if (!saved.ok) {
    return NextResponse.json({ error: saved.error }, { status: 400 })
  }

  addAsset({
    record_id: id,
    kind,
    image_path: saved.publicPath,
    caption: data.get('caption')?.toString().trim() || null,
    checklist_result: data.get('checklist_result')?.toString().trim() || null,
    is_public: data.get('is_public')?.toString() === 'on',
  })

  return NextResponse.redirect(
    redirectTarget(req, `/admin/characters/${rec.character}/${id}`),
    { status: 303 }
  )
}
