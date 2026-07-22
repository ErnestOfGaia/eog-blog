// Character Development Records API (D2) — list + create version.
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi, redirectTarget } from '@/lib/auth'
import { createRecord, getRecordsByCharacter, isCharacterSlug } from '@/lib/character-records'
import type { CharacterSlug } from '@/types'

// GET /api/character-records?character=<slug> — admin list (JSON).
export async function GET(req: NextRequest) {
  const unauth = await requireAdminApi()
  if (unauth) return unauth

  const slug = req.nextUrl.searchParams.get('character')
  if (!slug || !isCharacterSlug(slug)) {
    return NextResponse.json({ error: 'Unknown character' }, { status: 400 })
  }
  return NextResponse.json({ records: getRecordsByCharacter(slug) })
}

// POST /api/character-records — create a new version (form POST → redirect).
export async function POST(req: NextRequest) {
  const unauth = await requireAdminApi()
  if (unauth) return unauth

  const data = await req.formData()
  const character = data.get('character')?.toString() ?? ''
  if (!isCharacterSlug(character)) {
    return NextResponse.json({ error: 'Unknown character' }, { status: 400 })
  }
  const title = data.get('title')?.toString().trim() ?? ''
  if (!title) {
    return NextResponse.json({ error: 'Title required' }, { status: 400 })
  }

  const id = createRecord({
    character: character as CharacterSlug,
    title,
    summary: data.get('summary')?.toString().trim() || null,
    prompt_full: data.get('prompt_full')?.toString() || null,
    style_block: data.get('style_block')?.toString() || null,
    negative_block: data.get('negative_block')?.toString() || null,
    seed: data.get('seed')?.toString().trim() || null,
    tool: data.get('tool')?.toString().trim() || null,
    reference_image: data.get('reference_image')?.toString().trim() || null,
  })

  return NextResponse.redirect(redirectTarget(req, `/admin/characters/${character}/${id}`), {
    status: 303,
  })
}
