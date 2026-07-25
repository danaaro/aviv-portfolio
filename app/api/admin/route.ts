import { NextRequest } from 'next/server'
import { list, put, del } from '@vercel/blob'
import photographyFallback from '@/data/photography.json'
import cinemaFallback from '@/data/cinema.json'
import commercialFallback from '@/data/commercial.json'

export const dynamic = 'force-dynamic'

const FALLBACKS: Record<string, unknown> = {
  'photography.json': photographyFallback,
  'cinema.json': cinemaFallback,
  'commercial.json': commercialFallback,
}

// Vercel Blob's public CDN caches content per-URL and does not reliably
// invalidate on overwrite of a stable pathname (confirmed: even useCache:false
// and cache-busting query strings still served stale content once a pathname
// had been cached). So instead of overwriting one stable file, every write
// creates a new immutable, timestamped blob and reads pick the newest one —
// a URL that's never been requested before is always a guaranteed cache miss.

function prefixFor(file: string) {
  return `data/${file.replace(/\.json$/, '')}-`
}

async function readJSON(file: string) {
  const { blobs } = await list({ prefix: prefixFor(file) })
  if (blobs.length === 0) return FALLBACKS[file]
  const latest = blobs.reduce((a, b) => (a.uploadedAt > b.uploadedAt ? a : b))
  const res = await fetch(latest.url, { cache: 'no-store' })
  if (!res.ok) return FALLBACKS[file]
  return res.json()
}

async function writeJSON(file: string, data: unknown) {
  const prefix = prefixFor(file)
  await put(`${prefix}${Date.now()}.json`, JSON.stringify(data, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: true,
  })

  // Clean up older versions so blobs don't accumulate forever.
  const { blobs } = await list({ prefix })
  const stale = blobs.sort((a, b) => +b.uploadedAt - +a.uploadedAt).slice(1)
  if (stale.length > 0) await del(stale.map(b => b.url))
}

const ALLOWED_USERS: Record<string, string | undefined> = {
  aviv: process.env.ADMIN_PASSWORD_AVIV,
  dana: process.env.ADMIN_PASSWORD_DANA,
}

function checkAuth(body: { username?: string; password?: string }) {
  const expected = body.username ? ALLOWED_USERS[body.username] : undefined
  return !!expected && body.password === expected
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  if (searchParams.get('action') !== 'read') {
    return Response.json({ error: 'Bad request' }, { status: 400 })
  }
  const [photography, cinema, commercial] = await Promise.all([
    readJSON('photography.json'),
    readJSON('cinema.json'),
    readJSON('commercial.json'),
  ])
  return Response.json({ photography, cinema, commercial })
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (body.action === 'auth') {
    if (checkAuth(body)) {
      return Response.json({ ok: true })
    }
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!checkAuth(body)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (body.action === 'update') {
    const { section, key, data } = body as { section: string; key: string; data: unknown }

    if (section === 'photography') {
      const existing = await readJSON('photography.json')
      existing[key] = data
      await writeJSON('photography.json', existing)
    } else if (section === 'cinema') {
      const existing = await readJSON('cinema.json')
      existing[key] = data
      await writeJSON('cinema.json', existing)
    } else if (section === 'commercial') {
      const existing = await readJSON('commercial.json')
      existing[key] = data
      await writeJSON('commercial.json', existing)
    } else {
      return Response.json({ error: 'Unknown section' }, { status: 400 })
    }

    return Response.json({ ok: true })
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 })
}
