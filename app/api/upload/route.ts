import { NextRequest } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return Response.json({ error: 'No file' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const blob = await put(`uploads/${filename}`, file, {
    access: 'public',
    contentType: file.type || undefined,
  })

  return Response.json({ url: blob.url })
}
