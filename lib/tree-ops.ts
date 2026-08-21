import { slugify, uniqueSlug } from './types'
import type { Folder, Item, PhotoItem, Tree } from './types'

/**
 * Pure tree edits used by the admin. Each returns a new Tree; the server
 * re-validates and renumbers everything in normalizeTree before saving.
 */

let counter = 0
export function newId(): string {
  return `${Date.now().toString(36)}${(counter++).toString(36)}`
}

export function childrenOf(tree: Tree, parentId: string | null): Folder[] {
  return tree.folders.filter(f => f.parentId === parentId).sort((a, b) => a.position - b.position)
}

export function itemsOf(tree: Tree, folderId: string): Item[] {
  return tree.items.filter(i => i.folderId === folderId).sort((a, b) => a.position - b.position)
}

/** A folder and everything beneath it. */
export function descendantIds(tree: Tree, folderId: string): string[] {
  const out = [folderId]
  for (const child of tree.folders.filter(f => f.parentId === folderId)) {
    out.push(...descendantIds(tree, child.id))
  }
  return out
}

/** Total items in a folder and all its subfolders — what A2 shows on each tile. */
export function deepItemCount(tree: Tree, folderId: string): number {
  const ids = new Set(descendantIds(tree, folderId))
  return tree.items.filter(i => ids.has(i.folderId)).length
}

export function addFolder(tree: Tree, parentId: string, name: string): Tree {
  const siblings = childrenOf(tree, parentId)
  const folder: Folder = {
    id: newId(),
    name: name.trim(),
    slug: uniqueSlug(slugify(name), siblings.map(s => s.slug)),
    parentId,
    position: siblings.length,
    visible: true,
  }
  return { ...tree, folders: [...tree.folders, folder] }
}

export function updateFolder(tree: Tree, id: string, patch: Partial<Folder>): Tree {
  return {
    ...tree,
    folders: tree.folders.map(f => {
      if (f.id !== id) return f
      // Renaming re-slugs, which changes the folder's public URL.
      const next = { ...f, ...patch }
      if (patch.name && patch.name !== f.name && !f.system) {
        const siblings = childrenOf(tree, next.parentId).filter(s => s.id !== id)
        next.slug = uniqueSlug(slugify(patch.name), siblings.map(s => s.slug))
      }
      return next
    }),
  }
}

/** Deletes a folder, its subfolders, and every item inside them. */
export function deleteFolder(tree: Tree, id: string): Tree {
  const doomed = new Set(descendantIds(tree, id))
  return {
    folders: tree.folders.filter(f => !doomed.has(f.id)),
    items: tree.items.filter(i => !doomed.has(i.folderId)),
  }
}

export function blankPhoto(folderId: string, src: string, position: number): PhotoItem {
  return {
    id: newId(),
    folderId,
    position,
    kind: 'photo',
    title: '',
    caption: '',
    tags: [],
    alt: '',
    src,
  }
}

/** New uploads land at the front of the folder (A4). */
export function addItemsToFront(tree: Tree, folderId: string, items: Item[]): Tree {
  const existing = itemsOf(tree, folderId)
  const reordered = [...items, ...existing].map((item, i) => ({ ...item, position: i }))
  const untouched = tree.items.filter(i => i.folderId !== folderId)
  return { ...tree, items: [...untouched, ...reordered] }
}

export function updateItem(tree: Tree, id: string, patch: Partial<Item>): Tree {
  return {
    ...tree,
    items: tree.items.map(i => (i.id === id ? ({ ...i, ...patch } as Item) : i)),
  }
}

export function deleteItems(tree: Tree, ids: string[]): Tree {
  const doomed = new Set(ids)
  return {
    folders: tree.folders.map(f =>
      f.coverItemId && doomed.has(f.coverItemId) ? { ...f, coverItemId: undefined } : f
    ),
    items: tree.items.filter(i => !doomed.has(i.id)),
  }
}

/**
 * Move an item `delta` places within its folder. Reordering writes the same
 * `position` field a drag-and-drop implementation will, so A5 is a UI swap.
 */
export function moveItem(tree: Tree, id: string, delta: number): Tree {
  const item = tree.items.find(i => i.id === id)
  if (!item) return tree

  const siblings = itemsOf(tree, item.folderId)
  const from = siblings.findIndex(i => i.id === id)
  const to = from + delta
  if (from < 0 || to < 0 || to >= siblings.length) return tree

  const reordered = [...siblings]
  const [moved] = reordered.splice(from, 1)
  reordered.splice(to, 0, moved)

  const renumbered = reordered.map((i, index) => ({ ...i, position: index }))
  const untouched = tree.items.filter(i => i.folderId !== item.folderId)
  return { ...tree, items: [...untouched, ...renumbered] }
}

/** Same, for folders within their parent. */
export function moveFolder(tree: Tree, id: string, delta: number): Tree {
  const folder = tree.folders.find(f => f.id === id)
  if (!folder || folder.system) return tree

  const siblings = childrenOf(tree, folder.parentId)
  const from = siblings.findIndex(f => f.id === id)
  const to = from + delta
  if (from < 0 || to < 0 || to >= siblings.length) return tree

  const reordered = [...siblings]
  const [moved] = reordered.splice(from, 1)
  reordered.splice(to, 0, moved)

  const positions = new Map(reordered.map((f, index) => [f.id, index]))
  return {
    ...tree,
    folders: tree.folders.map(f => (positions.has(f.id) ? { ...f, position: positions.get(f.id)! } : f)),
  }
}

export function setCover(tree: Tree, folderId: string, itemId: string): Tree {
  return updateFolder(tree, folderId, { coverItemId: itemId })
}

/** Root-first ancestor chain, including the folder itself. */
export function crumbsFor(tree: Tree, folderId: string | null): Folder[] {
  const chain: Folder[] = []
  let current = folderId ? tree.folders.find(f => f.id === folderId) : undefined
  while (current) {
    chain.unshift(current)
    const parentId: string | null = current.parentId
    current = parentId ? tree.folders.find(f => f.id === parentId) : undefined
  }
  return chain
}

/** Flat, indented list of every folder — the A7 parent picker. */
export function folderOptions(
  tree: Tree,
  excludeSubtreeOf?: string
): { id: string; label: string }[] {
  const excluded = excludeSubtreeOf ? new Set(descendantIds(tree, excludeSubtreeOf)) : new Set()
  const out: { id: string; label: string }[] = []

  const walk = (parentId: string | null, depth: number) => {
    for (const folder of childrenOf(tree, parentId)) {
      if (excluded.has(folder.id)) continue
      out.push({ id: folder.id, label: `${'— '.repeat(depth)}${folder.name}` })
      walk(folder.id, depth + 1)
    }
  }
  walk(null, 0)
  return out
}
