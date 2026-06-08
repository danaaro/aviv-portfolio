import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

function readJSON(file: string) {
  const p = path.join(DATA_DIR, file)
  return JSON.parse(fs.readFileSync(p, 'utf-8'))
}

function writeJSON(file: string, data: unknown) {
  const p = path.join(DATA_DIR, file)
  fs.writeFileSync(p, JSON.stringify(data, null, 2))
}

function checkAuth(body: { password?: string }) {
  return body.password === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  if (searchParams.get('action') !== 'read') {
    return Response.json({ error: 'Bad request' }, { status: 400 })
  }
  const photography = readJSON('photography.json')
  const cinema = readJSON('cinema.json')
  const commercial = readJSON('commercial.json')
  return Response.json({ photography, cinema, commercial })
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (body.action === 'auth') {
    if (body.password === process.env.ADMIN_PASSWORD) {
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
      const existing = readJSON('photography.json')
      existing[key] = data
      writeJSON('photography.json', existing)
    } else if (section === 'cinema') {
      const existing = readJSON('cinema.json')
      existing[key] = data
      writeJSON('cinema.json', existing)
    } else if (section === 'commercial') {
      const existing = readJSON('commercial.json')
      existing[key] = data
      writeJSON('commercial.json', existing)
    } else {
      return Response.json({ error: 'Unknown section' }, { status: 400 })
    }

    return Response.json({ ok: true })
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 })
}
