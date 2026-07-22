// Admin content creation (design plan 04). Creates a draft owned by 'ernest'.
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi, redirectTarget } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { slugify, uniqueSlug } from '@/lib/utils'
import { parseContentForm } from '@/lib/content-form'

export async function POST(req: NextRequest) {
  const unauth = await requireAdminApi()
  if (unauth) return unauth

  const parsed = parseContentForm(await req.formData())
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }
  const f = parsed.fields

  const db = getDb()
  const slug = uniqueSlug(db, slugify(f.title))

  const result = db
    .prepare(
      `INSERT INTO content
         (slug, title, body, excerpt, tags, cover_image, cover_image_alt,
          seo_title, seo_description, canonical_url, discuss_linkedin_url,
          status, author)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', 'ernest')`
    )
    .run(
      slug,
      f.title,
      f.body,
      f.excerpt,
      f.tags,
      f.cover_image,
      f.cover_image_alt,
      f.seo_title,
      f.seo_description,
      f.canonical_url,
      f.discuss_linkedin_url
    )

  const id = Number(result.lastInsertRowid)
  return NextResponse.redirect(redirectTarget(req, `/admin/${id}`), { status: 303 })
}
