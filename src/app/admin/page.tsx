import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { KanbanBoard, type KanbanRow } from '@/components/admin/KanbanBoard'
import { withBase } from '@/lib/paths'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  await requireAdmin()

  const db = getDb()
  const rows = db
    .prepare(
      `SELECT id, title, author, status, updated_at
       FROM content
       ORDER BY updated_at DESC`
    )
    .all() as KanbanRow[]

  return (
    <main className="p-6 min-h-screen bg-stone-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-eog-navy">Editorial Board</h1>
        <div className="flex items-center gap-3">
          <form action={withBase('/api/admin/logout')} method="POST">
            <button
              type="submit"
              className="border border-stone-300 text-stone-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-stone-100 transition-colors"
            >
              Log out
            </button>
          </form>
          <Link
            href="/admin/new"
            className="bg-eog-navy text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-colors"
          >
            + New draft
          </Link>
        </div>
      </div>

      <KanbanBoard initialItems={rows} />
    </main>
  )
}
