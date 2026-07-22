// Admin image upload. Writes to the volume; returns a /blog/media/<file> URL.
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth'
import { saveUpload } from '@/lib/uploads'
import { withBase } from '@/lib/paths'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const unauth = await requireAdminApi()
  if (unauth) return unauth

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart form-data' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const result = await saveUpload(file)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ url: withBase(`/media/${result.filename}`), filename: result.filename }, { status: 201 })
}
