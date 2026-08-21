import type { Metadata } from 'next'
import FolderView from '@/components/FolderView'
import { getTree, search } from '@/lib/content'
import { toFolderCard, toItemCard } from '@/lib/view'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Search — Aviv Shmuelof' }

interface Props {
  searchParams: Promise<{ q?: string }>
}

/** V6 — matches folder names, titles, captions, alt text and tags. */
export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams
  const tree = await getTree()
  const { folders, items } = search(tree, q)

  const total = folders.length + items.length
  const status = q.trim()
    ? `${total} ${total === 1 ? 'result' : 'results'}`
    : 'Type to search folders, captions and tags'

  return (
    <FolderView
      title="Search"
      crumbs={[{ label: `Search${q ? `: ${q}` : ''}`, href: `/search?q=${encodeURIComponent(q)}` }]}
      folders={folders.map(f => toFolderCard(tree, f))}
      items={items.map(toItemCard)}
      emptyLabel={q.trim() ? `No matches for “${q}”` : 'Search folders, captions and tags'}
      status={status}
      grouped
    />
  )
}
