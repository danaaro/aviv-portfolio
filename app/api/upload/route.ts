import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return Response.json({ error: 'No file' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const filepath = path.join(UPLOADS_DIR, filename)

  const buffer = Buffer.from(await file.arrayBuffer())
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  fs.writeFileSync(filepath, buffer)

  return Response.json({ url: `/uploads/${filename}` })
}
