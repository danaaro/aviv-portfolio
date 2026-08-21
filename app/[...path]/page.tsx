import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import FolderView from '@/components/FolderView'
import { getTree, folderByPath, folderCover } from '@/lib/content'
import { folderCardsIn, itemCardsIn, toCrumbs } from '@/lib/view'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ path: string[] }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params
  const tree = await getTree()
  const folder = folderByPath(tree, path)
  if (!folder) return { title: 'Not found — Aviv Shmuelof' }

  const cover = folderCover(tree, folder)
  return {
    title: `${folder.name} — Aviv Shmuelof`,
    openGraph: {
      title: `${folder.name} — Aviv Shmuelof`,
      type: 'website',
      ...(cover ? { images: [cover] } : {}),
    },
  }
}

/**
 * V2 / V3 — one recursive folder view at any depth. Renders child folders as
 * icons, child items as tiles, or both.
 */
export default async function FolderPage({ params }: Props) {
  const { path } = await params
  const tree = await getTree()
  const folder = folderByPath(tree, path)
  if (!folder) notFound()

  return (
    <FolderView
      title={folder.name}
      crumbs={toCrumbs(tree, folder.id)}
      folders={folderCardsIn(tree, folder.id)}
      items={itemCardsIn(tree, folder.id)}
      emptyLabel="Content coming soon"
    />
  )
}
