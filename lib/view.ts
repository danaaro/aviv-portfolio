import { childFolders, folderCover, itemsIn, pathOf, breadcrumb } from './content'
import { itemThumb } from './types'
import type { Folder, Item, Tree } from './types'
import type { Crumb, FolderCard, ItemCard } from '@/components/FolderView'

/** Serializable view models for FolderView. Keeps the pages thin. */

export function toFolderCard(tree: Tree, folder: Folder): FolderCard {
  return {
    id: folder.id,
    label: folder.name,
    href: pathOf(tree, folder.id),
    thumb: folderCover(tree, folder),
  }
}

export function folderCardsIn(tree: Tree, parentId: string): FolderCard[] {
  return childFolders(tree, parentId).map(f => toFolderCard(tree, f))
}

export function toItemCard(item: Item): ItemCard {
  const base = {
    id: item.id,
    title: item.title,
    caption: item.caption,
    alt: item.alt || item.title || item.caption,
    thumb: itemThumb(item),
  }

  if (item.kind === 'film') {
    return {
      ...base,
      kind: 'film',
      film: {
        id: item.id,
        title: item.title,
        duration: item.duration,
        year: item.year,
        posterSrc: item.posterSrc,
        videoUrl: item.videoUrl,
        description: item.caption,
        director: item.director,
        producer: item.producer,
        cinematographer: item.cinematographer,
        editor: item.editor,
        productionCompany: item.productionCompany,
        awards: item.awards,
        stills: item.stills,
      },
    }
  }

  return {
    ...base,
    kind: 'photo',
    ...(item.youtubeUrl ? { youtubeUrl: item.youtubeUrl } : {}),
  }
}

export function itemCardsIn(tree: Tree, folderId: string): ItemCard[] {
  return itemsIn(tree, folderId).map(toItemCard)
}

export function toCrumbs(tree: Tree, folderId: string): Crumb[] {
  return breadcrumb(tree, folderId).map(f => ({ label: f.name, href: pathOf(tree, f.id) }))
}
