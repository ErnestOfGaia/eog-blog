// Character Development Records API (D2) — update / set-current / toggle-public / delete one record.
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi, redirectTarget } from '@/lib/auth'
import {
  getRecord,
  updateRecord,
  setCurrent,
  setPublic,
  deleteRecord,
  getAssets,
} from '@/lib/character-records'
import { deletePublicFile } from '@/lib/uploads'

// POST handles three actions via a hidden `action` field (HTML forms can't PATCH):
//   action=update        → save edited fields
//   action=set_current   → promote to the character's current version (supersedes others)
//   action=toggle_public → flip is_public
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdminApi()
  if (unauth) return unauth

  const id = parseInt((await params).id, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const rec = getRecord(id)
  if (!rec) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await req.formData()
  const action = data.get('action')?.toString() ?? 'update'

  if (action === 'set_current') {
    setCurrent(id)
  } else if (action === 'toggle_public') {
    setPublic(id, rec.is_public !== 1)
  } else {
    const title = data.get('title')?.toString().trim()
    if (title !== undefined && title === '') {
      return NextResponse.json({ error: 'Title required' }, { status: 400 })
    }
    updateRecord(id, {
      ...(title !== undefined ? { title } : {}),
      summary: data.get('summary')?.toString().trim() || null,
      prompt_full: data.get('prompt_full')?.toString() || null,
      style_block: data.get('style_block')?.toString() || null,
      negative_block: data.get('negative_block')?.toString() || null,
      seed: data.get('seed')?.toString().trim() || null,
      tool: data.get('tool')?.toString().trim() || null,
      reference_image: data.get('reference_image')?.toString().trim() || null,
    })
  }

  return NextResponse.redirect(
    redirectTarget(req, `/admin/characters/${rec.character}/${id}`),
    { status: 303 }
  )
}

// DELETE /api/character-records/[id] — remove the record, its asset rows (FK cascade),
// and best-effort delete the asset files on disk.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdminApi()
  if (unauth) return unauth

  const id = parseInt((await params).id, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const rec = getRecord(id)
  if (!rec) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const assets = getAssets(id)
  deleteRecord(id) // cascades asset rows
  await Promise.all(assets.map((a) => deletePublicFile(a.image_path)))

  return NextResponse.json({ ok: true, character: rec.character })
}
