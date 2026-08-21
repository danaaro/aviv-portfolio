import { NextRequest } from 'next/server'
import { put } from '@vercel/blob'
import { requireAdmin } from '@/lib/session'

export const dynamic = 'force-dynamic'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
const MAX_BYTES = 25 * 1024 * 1024

/** Mirrors localStoreEnabled() in lib/content.ts — keep local dev off production storage. */
function localStoreEnabled(): boolean {
  const mode = process.env.CONTENT_STORE
  if (mode === 'local') return true
  if (mode === 'blob') return false
  return !process.env.BLOB_READ_WRITE_TOKEN
}

export async function POST(req: NextRequest) {
  // Previously open to the world, which let anyone write to the Blob store.
  const denied = await requireAdmin()
  if (denied) return denied

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return Response.json({ error: 'No file' }, { status: 400 })
  }
  if (!ALLOWED.includes(file.type)) {
    return Response.json({ error: `Unsupported file type: ${file.type || 'unknown'}` }, { status: 415 })
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: 'File is larger than 25 MB' }, { status: 413 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  // Local dev writes into public/uploads so nothing lands in production storage.
  if (localStoreEnabled()) {
    const [fs, path] = await Promise.all([import('node:fs/promises'), import('node:path')])
    const dir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()))
    return Response.json({ url: `/uploads/${filename}` })
  }

  const blob = await put(`uploads/${filename}`, file, {
    access: 'public',
    contentType: file.type,
  })

  return Response.json({ url: blob.url })
}
