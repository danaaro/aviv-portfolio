import { list, put, del } from '@vercel/blob'
import seed from '@/data/tree.json'
import { itemThumb } from './types'
import type { Folder, Item, Tree } from './types'

// Vercel Blob's public CDN caches content per-URL and does not reliably
// invalidate on overwrite of a stable pathname (confirmed: even useCache:false
// and cache-busting query strings still served stale content once a pathname
// had been cached). So instead of overwriting one stable file, every write
// creates a new immutable, timestamped blob and reads pick the newest one —
// a URL that's never been requested before is always a guaranteed cache miss.

const PREFIX = 'data/tree-'

/** Local dev store: a plain JSON file, no network, isolated from production. */
const LOCAL_FILE = 'data/tree.local.json'

/**
 * Which backing store to use.
 *   CONTENT_STORE=local  — the JSON file above. Nothing touches production.
 *   CONTENT_STORE=blob   — Vercel Blob.
 *   unset                — blob when a token exists, otherwise local.
 *
 * Local is the sane default for `next dev`: reads of the blob's public URL are
 * routinely answered with Vercel's bot-protection challenge (403 + an HTML
 * page) from a developer machine, and the blob store is shared with
 * production, so local edits would otherwise write to live content.
 */
function localStoreEnabled(): boolean {
  const mode = process.env.CONTENT_STORE
  if (mode === 'local') return true
  if (mode === 'blob') return false
  return !process.env.BLOB_READ_WRITE_TOKEN
}

async function localPath() {
  const path = await import('node:path')
  return path.join(process.cwd(), LOCAL_FILE)
}

async function readLocal(): Promise<TreeLoad> {
  const fs = await import('node:fs/promises')
  const file = await localPath()
  try {
    const parsed: unknown = JSON.parse(await fs.readFile(file, 'utf-8'))
    if (!isTree(parsed)) return { tree: seed as Tree, source: 'error', error: `${LOCAL_FILE} is not a content tree` }
    return { tree: parsed, source: 'local' }
  } catch (err) {
    // First run: start from the bundled seed and write it out.
    if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') {
      await fs.writeFile(file, JSON.stringify(seed, null, 2))
      return { tree: seed as Tree, source: 'local' }
    }
    const message = err instanceof Error ? err.message : String(err)
    return { tree: seed as Tree, source: 'error', error: message }
  }
}

async function writeLocal(tree: Tree): Promise<void> {
  const fs = await import('node:fs/promises')
  await fs.writeFile(await localPath(), JSON.stringify(tree, null, 2))
}

/**
 * Where the tree we're holding actually came from.
 *   'blob'  — the live content. Safe to edit.
 *   'local' — the local dev file. Safe to edit.
 *   'empty' — no blob written yet, so the bundled seed *is* the truth. Safe to edit.
 *   'error' — the store exists but we could not read it. The seed is a stand-in so
 *             the site keeps rendering; saving over it would destroy real data.
 */
export type TreeSource = 'blob' | 'local' | 'empty' | 'error'

export interface TreeLoad {
  tree: Tree
  source: TreeSource
  error?: string
}

function isTree(value: unknown): value is Tree {
  if (!value || typeof value !== 'object') return false
  const { folders, items } = value as Partial<Tree>
  return Array.isArray(folders) && Array.isArray(items)
}

/**
 * Read the newest tree blob.
 *
 * The blob's public URL sits behind Vercel's edge protection, which can answer
 * with an HTML "Security Checkpoint" page — sometimes carrying a 200 status.
 * `res.ok` is therefore not enough: an unchecked `res.json()` there throws, and
 * silently falling back to the bundled seed would let the admin save stale
 * content over the real tree. So we verify we actually got a tree, retry once,
 * and otherwise report 'error' so callers can refuse to write.
 */
export async function loadTree(): Promise<TreeLoad> {
  if (localStoreEnabled()) return readLocal()

  try {
    const { blobs } = await list({ prefix: PREFIX })
    if (blobs.length === 0) return { tree: seed as Tree, source: 'empty' }

    const latest = blobs.reduce((a, b) => (+a.uploadedAt > +b.uploadedAt ? a : b))

    let lastError = ''
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 250))

      const res = await fetch(latest.url, { cache: 'no-store', headers: { accept: 'application/json' } })
      const body = res.ok ? await res.text() : ''
      if (!res.ok) {
        lastError =
          res.headers.get('x-vercel-mitigated') === 'challenge'
            ? `blob blocked by Vercel bot protection (${res.status})`
            : `blob responded ${res.status}`
        continue
      }

      let parsed: unknown
      try {
        parsed = JSON.parse(body)
      } catch {
        // Almost always the edge-protection interstitial rather than a bad write.
        lastError = body.trimStart().startsWith('<')
          ? 'blob returned an HTML page instead of JSON (edge protection)'
          : 'blob returned malformed JSON'
        continue
      }

      if (!isTree(parsed)) {
        lastError = 'blob JSON is not a content tree'
        continue
      }
      return { tree: parsed, source: 'blob' }
    }

    console.error('loadTree: falling back to seed —', lastError)
    return { tree: seed as Tree, source: 'error', error: lastError }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('loadTree: blob store unavailable —', message)
    return { tree: seed as Tree, source: 'error', error: message }
  }
}

/** Convenience for public pages, which just want something to render. */
export async function getTree(): Promise<Tree> {
  return (await loadTree()).tree
}

export async function saveTree(tree: Tree): Promise<void> {
  if (localStoreEnabled()) return writeLocal(tree)

  await put(`${PREFIX}${Date.now()}.json`, JSON.stringify(tree, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: true,
  })

  // Clean up older versions so blobs don't accumulate forever. Keep the two
  // newest, so a reader that listed just before this write still resolves.
  const { blobs } = await list({ prefix: PREFIX })
  const stale = blobs.sort((a, b) => +b.uploadedAt - +a.uploadedAt).slice(2)
  if (stale.length > 0) await del(stale.map(b => b.url))
}

// ── Queries ──────────────────────────────────────────
// Ordering always comes from the explicit `position` integer, never from
// filename, id or upload date.

const byPosition = <T extends { position: number }>(a: T, b: T) => a.position - b.position

export function rootFolders(tree: Tree): Folder[] {
  return tree.folders.filter(f => f.parentId === null && f.visible).sort(byPosition)
}

export function childFolders(tree: Tree, parentId: string): Folder[] {
  return tree.folders.filter(f => f.parentId === parentId && f.visible).sort(byPosition)
}

export function itemsIn(tree: Tree, folderId: string): Item[] {
  return tree.items.filter(i => i.folderId === folderId).sort(byPosition)
}

export function folderById(tree: Tree, id: string): Folder | undefined {
  return tree.folders.find(f => f.id === id)
}

export function itemById(tree: Tree, id: string): Item | undefined {
  return tree.items.find(i => i.id === id)
}

/** Walk a slug path from the roots down. Returns undefined if any hop misses. */
export function folderByPath(tree: Tree, slugs: string[]): Folder | undefined {
  let parentId: string | null = null
  let found: Folder | undefined
  for (const slug of slugs) {
    found = tree.folders.find(f => f.parentId === parentId && f.slug === slug && f.visible)
    if (!found) return undefined
    parentId = found.id
  }
  return found
}

/** Root-first ancestor chain, including the folder itself. */
export function breadcrumb(tree: Tree, folderId: string): Folder[] {
  const chain: Folder[] = []
  let current = folderById(tree, folderId)
  while (current) {
    chain.unshift(current)
    current = current.parentId ? folderById(tree, current.parentId) : undefined
  }
  return chain
}

export function pathOf(tree: Tree, folderId: string): string {
  return '/' + breadcrumb(tree, folderId).map(f => f.slug).join('/')
}

/** The folder an item lives in, as a URL path. */
export function itemPath(tree: Tree, item: Item): string {
  return pathOf(tree, item.folderId)
}

/** Cover image for a folder: its chosen cover, else the first item, else the first descendant item. */
export function folderCover(tree: Tree, folder: Folder): string | undefined {
  if (folder.coverItemId) {
    const cover = itemById(tree, folder.coverItemId)
    if (cover) return itemThumb(cover)
  }
  const own = itemsIn(tree, folder.id)[0]
  if (own) return itemThumb(own)

  for (const child of childFolders(tree, folder.id)) {
    const nested = folderCover(tree, child)
    if (nested) return nested
  }
  return undefined
}

/** How many things a folder shows — subfolders plus items. Drives the "N items" status bar. */
export function countIn(tree: Tree, folderId: string): number {
  return childFolders(tree, folderId).length + itemsIn(tree, folderId).length
}

// ── Search (V6) ──────────────────────────────────────

export interface SearchResults {
  folders: Folder[]
  items: Item[]
}

/** Matches folder names, item titles, captions, alt text and tags. */
export function search(tree: Tree, query: string): SearchResults {
  const q = query.trim().toLowerCase()
  if (!q) return { folders: [], items: [] }

  const folders = tree.folders
    .filter(f => f.visible && !f.system && f.name.toLowerCase().includes(q))
    .sort(byPosition)

  const items = tree.items
    .filter(i =>
      [i.title, i.caption, i.alt, ...i.tags].some(field => field?.toLowerCase().includes(q))
    )
    .sort(byPosition)

  return { folders, items }
}
