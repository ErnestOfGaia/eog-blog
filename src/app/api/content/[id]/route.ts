// Admin content update + delete (design plan 04).
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi, redirectTarget } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { parseContentForm } from '@/lib/content-form'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdminApi()
  if (unauth) return unauth

  const id = parseInt((await params).id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const parsed = parseContentForm(await req.formData())
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }
  const f = parsed.fields

  const db = getDb()
  db.prepare(
    `UPDATE content
       SET title=?, body=?, excerpt=?, tags=?, cover_image=?, cover_image_alt=?,
           seo_title=?, seo_description=?, canonical_url=?, discuss_linkedin_url=?
     WHERE id=?`
  ).run(
    f.title,
    f.body,
    f.excerpt,
    f.tags,
    f.cover_image,
    f.cover_image_alt,
    f.seo_title,
    f.seo_description,
    f.canonical_url,
    f.discuss_linkedin_url,
    id
  )

  return NextResponse.redirect(redirectTarget(req, `/admin/${id}`), { status: 303 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdminApi()
  if (unauth) return unauth

  const id = parseInt((await params).id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const db = getDb()
  db.prepare('DELETE FROM content WHERE id = ?').run(id)
  return NextResponse.json({ ok: true })
}
