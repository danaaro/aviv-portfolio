import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PhotoPermalink from '@/components/PhotoPermalink'
import { getTree, itemById, itemsIn, folderById, pathOf } from '@/lib/content'
import { itemThumb } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

function describe(title: string, caption: string) {
  return [title, caption].filter(Boolean).join(' — ') || 'Photograph by Aviv Shmuelof'
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const tree = await getTree()
  const item = itemById(tree, id)
  if (!item) return { title: 'Photo not found — Aviv Shmuelof' }

  const heading = describe(item.title, item.caption)
  const image = itemThumb(item)

  return {
    title: `${heading} — Aviv Shmuelof`,
    description: item.alt || heading,
    openGraph: {
      title: heading,
      description: item.alt || heading,
      type: 'article',
      ...(image ? { images: [{ url: image, alt: item.alt || heading }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: heading,
      ...(image ? { images: [image] } : {}),
    },
  }
}

/** Single-photo permalink — the target of the V5 share dialog. */
export default async function PhotoPage({ params }: Props) {
  const { id } = await params
  const tree = await getTree()
  const item = itemById(tree, id)
  if (!item) notFound()

  const folder = folderById(tree, item.folderId)
  if (!folder) notFound()

  // Arrow through the whole folder from a shared link, same as in the grid.
  const photos = itemsIn(tree, folder.id).filter(i => i.kind === 'photo' && !i.youtubeUrl)
  const startIndex = photos.findIndex(p => p.id === item.id)
  if (startIndex < 0) notFound()

  return (
    <PhotoPermalink
      photos={photos.map(p => ({
        id: p.id,
        src: itemThumb(p),
        alt: p.alt || p.title,
        title: p.title,
        caption: p.caption,
      }))}
      startIndex={startIndex}
      folderName={folder.name}
      folderHref={pathOf(tree, folder.id)}
    />
  )
}
