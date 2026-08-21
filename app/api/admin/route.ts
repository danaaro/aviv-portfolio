import { NextRequest } from 'next/server'
import { loadTree, saveTree } from '@/lib/content'
import { normalizeTree, TreeError } from '@/lib/normalize'
import { currentAdmin, requireAdmin } from '@/lib/session'

export const dynamic = 'force-dynamic'

/** Read the tree. Public — this is the same content the public pages render. */
export async function GET() {
  const [{ tree, source }, user] = await Promise.all([loadTree(), currentAdmin()])
  return Response.json({ tree, user, source })
}

/** Replace the tree. Admin only. Edits go live immediately — there is no publish step. */
export async function PUT(req: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied

  // If the live tree can't be read right now, whatever the browser is holding
  // is the bundled seed, not real content. Writing it back would wipe Aviv's
  // work, so refuse until the read path recovers.
  const { source, error } = await loadTree()
  if (source === 'error') {
    return Response.json(
      { error: `Can't reach the live content right now, so saving is blocked to avoid overwriting it. (${error})` },
      { status: 503 }
    )
  }

  try {
    const tree = normalizeTree(await req.json())
    await saveTree(tree)
    return Response.json({ ok: true, tree })
  } catch (err) {
    if (err instanceof TreeError) {
      return Response.json({ error: err.message }, { status: 400 })
    }
    console.error('tree save failed', err)
    return Response.json({ error: 'Save failed' }, { status: 500 })
  }
}
