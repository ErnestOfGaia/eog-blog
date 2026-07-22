// Character Development Records API (D2) — toggle-public / delete a single asset.
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi, redirectTarget } from '@/lib/auth'
import { getAsset, getRecord, setAssetPublic, deleteAsset } from '@/lib/character-records'
import { deletePublicFile } from '@/lib/uploads'

// POST action=toggle_public → flip the asset's is_public, redirect back to the record editor.
export async function POST(req: NextRequest, { params }: { params: Promise<{ assetId: string }> }) {
  const unauth = await requireAdminApi()
  if (unauth) return unauth

  const assetId = parseInt((await params).assetId, 10)
  if (isNaN(assetId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const asset = getAsset(assetId)
  if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await req.formData()
  if (data.get('action')?.toString() === 'toggle_public') {
    setAssetPublic(assetId, asset.is_public !== 1)
  }

  const rec = getRecord(asset.record_id)
  const dest = rec ? `/admin/characters/${rec.character}/${rec.id}` : '/admin/characters'
  return NextResponse.redirect(redirectTarget(req, dest), { status: 303 })
}

// DELETE /api/character-records/assets/[assetId] — remove row + file.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ assetId: string }> }) {
  const unauth = await requireAdminApi()
  if (unauth) return unauth

  const assetId = parseInt((await params).assetId, 10)
  if (isNaN(assetId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const asset = getAsset(assetId)
  if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  deleteAsset(assetId)
  await deletePublicFile(asset.image_path)
  return NextResponse.json({ ok: true })
}
