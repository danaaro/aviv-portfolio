import FolderView from '@/components/FolderView'
import SmileyStage from '@/components/SmileyStage'
import { getTree, rootFolders } from '@/lib/content'
import { currentAdmin } from '@/lib/session'
import { toFolderCard } from '@/lib/view'

export const dynamic = 'force-dynamic'

/** V1 — home. The three categories plus the About leaf. */
export default async function Home() {
  const [tree, admin] = await Promise.all([getTree(), currentAdmin()])

  const folders = [
    ...rootFolders(tree).map(f => toFolderCard(tree, f)),
    { id: 'about', label: 'About', href: '/about', glyph: 'about' as const },
    // Only a signed-in admin ever sees this tile; to everyone else /admin stays
    // an unlisted URL. The tile is a convenience, never the access control —
    // /admin and every write endpoint are gated server-side regardless.
    ...(admin
      ? [{ id: 'admin', label: 'Admin', href: '/admin', glyph: 'admin' as const }]
      : []),
  ]

  return (
    <FolderView title="Aviv Shmuelof" folders={folders}>
      <SmileyStage />
    </FolderView>
  )
}
