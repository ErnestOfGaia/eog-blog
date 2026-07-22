// Scheduled release endpoint (design plan 04 §3.5). Bearer-authed; VPS system
// cron hits it ~every 15 min. Promotes every approved post whose publish_at is due.
// The agent never publishes — this is the only path from approved → published.

import { NextRequest, NextResponse } from 'next/server'
import { verifyBearer } from '@/lib/auth'
import { publishDuePosts } from '@/lib/scheduler'

export const dynamic = 'force-dynamic'

async function handle(req: NextRequest) {
  if (!verifyBearer(req, process.env.CRON_API_KEY)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = publishDuePosts()
  return NextResponse.json({ ok: true, ...result }, { status: 200 })
}

// Accept POST (preferred) and GET (some cron setups only do GET).
export const POST = handle
export const GET = handle
