// One recursive content tree. Three fixed system roots (photography / cinema /
// commercial); arbitrary folder nesting inside each.

export interface Folder {
  id: string
  name: string
  slug: string
  /** null only for the three system roots */
  parentId: string | null
  position: number
  coverItemId?: string
  visible: boolean
  /** system roots cannot be renamed, reparented or deleted */
  system?: true
}

interface ItemBase {
  id: string
  folderId: string
  position: number
  title: string
  caption: string
  tags: string[]
  alt: string
}

export interface PhotoItem extends ItemBase {
  kind: 'photo'
  src: string
  width?: number
  height?: number
  /** set when the tile is really a video link — keeps the play badge behaviour */
  youtubeUrl?: string
}

export interface Still {
  id: string
  src: string
  caption: string
}

export interface FilmItem extends ItemBase {
  kind: 'film'
  posterSrc: string
  videoUrl: string
  duration: string
  year?: number
  director: string
  producer: string
  cinematographer: string
  editor: string
  productionCompany: string
  awards: string[]
  stills: Still[]
}

export type Item = PhotoItem | FilmItem

export interface Tree {
  folders: Folder[]
  items: Item[]
}

export const ROOT_SLUGS = ['photography', 'cinema', 'commercial'] as const
export type RootSlug = (typeof ROOT_SLUGS)[number]

/** The thumbnail a tile should show, whichever kind it is. */
export function itemThumb(item: Item): string {
  return item.kind === 'film' ? item.posterSrc : item.src
}

export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'untitled'
  )
}

/** Make `slug` unique among `taken`, appending -2, -3 … as needed. */
export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const used = new Set(taken)
  if (!used.has(base)) return base
  let n = 2
  while (used.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}
