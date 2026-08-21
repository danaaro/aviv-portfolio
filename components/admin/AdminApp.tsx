'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import FolderDialog from './FolderDialog'
import ItemInfo from './ItemInfo'
import { itemThumb } from '@/lib/types'
import type { Folder, Item, Tree } from '@/lib/types'
import {
  addFolder,
  addItemsToFront,
  blankPhoto,
  childrenOf,
  crumbsFor,
  deepItemCount,
  deleteFolder,
  deleteItems,
  itemsOf,
  moveFolder,
  moveItem,
  setCover,
  updateFolder,
  updateItem,
} from '@/lib/tree-ops'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

interface Props {
  initialTree: Tree
  user: string
  /** The live tree couldn't be read, so what's on screen is only a stand-in. */
  readOnly?: boolean
}

/** A2–A8. Edits are live the moment they save — there is no publish step. */
export default function AdminApp({ initialTree, user, readOnly = false }: Props) {
  const router = useRouter()
  const [tree, setTree] = useState<Tree>(initialTree)
  const [folderId, setFolderId] = useState<string | null>(null)
  const [save, setSave] = useState<SaveState>('idle')
  const [error, setError] = useState('')
  const [infoId, setInfoId] = useState<string | null>(null)
  const [dialog, setDialog] = useState<'new' | 'rename' | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<
    { kind: 'folder'; folder: Folder } | { kind: 'item'; item: Item } | null
  >(null)
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const folder = folderId ? tree.folders.find(f => f.id === folderId) : undefined
  const folders = childrenOf(tree, folderId)
  const items = folder ? itemsOf(tree, folder.id) : []
  const crumbs = crumbsFor(tree, folderId)
  const infoItem = infoId ? tree.items.find(i => i.id === infoId) : undefined

  /** Persist a new tree. Optimistic — local state updates first. */
  const commit = useCallback(
    async (next: Tree) => {
      if (readOnly) {
        setSave('error')
        setError("Editing is disabled: the live content can't be reached right now.")
        return
      }
      setTree(next)
      setSave('saving')
      setError('')
      try {
        const res = await fetch('/api/admin', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? 'Save failed')
        }
        // Adopt the server's canonical version (slugs, renumbered positions).
        const { tree: saved } = await res.json()
        setTree(saved)
        setSave('saved')
        setTimeout(() => setSave(s => (s === 'saved' ? 'idle' : s)), 2000)
        router.refresh()
      } catch (e) {
        setSave('error')
        setError(e instanceof Error ? e.message : 'Save failed')
      }
    },
    [router, readOnly]
  )

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Upload failed')
      setSave('error')
      return null
    }
    const { url } = await res.json()
    return url as string
  }, [])

  /** A4 — upload straight into the open folder; new files land at the front. */
  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || !folder) return
    const list = Array.from(files)
    setUploading({ done: 0, total: list.length })

    const uploaded: Item[] = []
    for (const [i, file] of list.entries()) {
      const url = await uploadFile(file)
      if (url) uploaded.push(blankPhoto(folder.id, url, i))
      setUploading({ done: i + 1, total: list.length })
    }

    setUploading(null)
    if (uploaded.length) await commit(addItemsToFront(tree, folder.id, uploaded))
    if (fileRef.current) fileRef.current.value = ''
  }

  const signOut = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.refresh()
  }

  const status = (() => {
    if (uploading) return `Uploading ${uploading.done} of ${uploading.total}…`
    if (save === 'saving') return 'Saving…'
    if (save === 'error') return error || 'Save failed'
    if (save === 'saved') return 'Saved — changes are live'
    const count = folders.length + items.length
    return `${count} ${count === 1 ? 'item' : 'items'} · signed in as ${user}`
  })()

  return (
    <div className="win">
      <div className="win-titlebar">
        <span className="win-close" aria-hidden="true" />
        <span className="win-title">
          {folder ? `${folder.name} — Editing` : 'Aviv Shmuelof — Editing'}
        </span>
      </div>

      {readOnly && (
        <div className="admin-banner">
          Can’t reach the live content right now, so this is a stand-in copy and editing is
          switched off. Nothing here has been lost — reload in a moment.
        </div>
      )}

      {/* Edit toolbar */}
      <div className="win-toolbar">
        {folderId && (
          <button
            className="win-back"
            onClick={() => setFolderId(folder?.parentId ?? null)}
            aria-label="Back"
          >
            ‹
          </button>
        )}

        <nav className="win-crumbs" aria-label="Breadcrumb">
          <button className="admin-crumb" onClick={() => setFolderId(null)}>
            Aviv Shmuelof
          </button>
          {crumbs.map((c, i) => (
            <span key={c.id}>
              <span className="win-crumb-sep">▸</span>
              {i === crumbs.length - 1 ? (
                <span className="win-crumb-current">{c.name}</span>
              ) : (
                <button className="admin-crumb" onClick={() => setFolderId(c.id)}>
                  {c.name}
                </button>
              )}
            </span>
          ))}
        </nav>

        <div className="admin-actions">
          <button
            className="win-btn"
            onClick={() => setDialog('new')}
            disabled={!folderId && folders.length === 0}
            title={folderId ? 'New folder here' : 'Open a category first'}
          >
            ＋ New Folder
          </button>
          {folder && !folder.system && (
            <button className="win-btn" onClick={() => setDialog('rename')}>
              Rename
            </button>
          )}
          {folder && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={e => handleFiles(e.target.files)}
              />
              <button className="win-btn" onClick={() => fileRef.current?.click()} disabled={!!uploading}>
                Upload
              </button>
            </>
          )}
          {folder && !folder.system && (
            <button
              className="win-btn"
              onClick={() => setConfirmDelete({ kind: 'folder', folder })}
            >
              Delete Folder
            </button>
          )}
          <Link className="win-btn" href="/" target="_blank">
            View site ↗
          </Link>
          <button className="win-btn" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>

      {/* Body — subfolders then items */}
      <div
        className="win-body"
        onDragOver={e => {
          if (folder) e.preventDefault()
        }}
        onDrop={e => {
          if (!folder) return
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
      >
        {folders.length === 0 && items.length === 0 && (
          <p className="win-empty">
            {folder ? 'Empty folder — upload photos or create a subfolder.' : 'No categories.'}
          </p>
        )}

        {folders.length > 0 && (
          <div className="folder-grid">
            {folders.map((f, i) => (
              <div key={f.id} className="admin-folder">
                <button className="folder-tile" onClick={() => setFolderId(f.id)}>
                  <span className="folder-icon">
                    <span className="folder-icon-tab" />
                    <span className="folder-icon-body" />
                  </span>
                  <span className="folder-label">
                    {f.name}
                    <span className="folder-meta">{deepItemCount(tree, f.id) || '—'}</span>
                  </span>
                </button>
                {!f.system && (
                  <div className="admin-reorder">
                    <button
                      className="admin-mini"
                      disabled={i === 0}
                      onClick={() => commit(moveFolder(tree, f.id, -1))}
                      aria-label="Move folder earlier"
                    >
                      ←
                    </button>
                    <button
                      className="admin-mini"
                      disabled={i === folders.length - 1}
                      onClick={() => commit(moveFolder(tree, f.id, 1))}
                      aria-label="Move folder later"
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className={`item-grid${folders.length > 0 ? ' spaced' : ''}`}>
            {items.map((item, i) => (
              <div key={item.id} className="admin-item">
                <div className={`item-tile${item.kind === 'film' ? ' poster' : ''}`}>
                  {itemThumb(item) ? (
                    <img src={itemThumb(item)} alt={item.alt} loading="lazy" />
                  ) : (
                    <span className="item-tile-blank">
                      {item.kind === 'film' ? 'FILM' : 'PHOTO'}
                    </span>
                  )}
                  {folder?.coverItemId === item.id && <span className="admin-cover-flag">Cover</span>}
                </div>

                <div className="admin-item-bar">
                  <button
                    className="admin-mini"
                    disabled={i === 0}
                    onClick={() => commit(moveItem(tree, item.id, -1))}
                    aria-label="Move earlier"
                  >
                    ←
                  </button>
                  <button className="admin-mini wide" onClick={() => setInfoId(item.id)}>
                    Info
                  </button>
                  <button
                    className="admin-mini"
                    onClick={() => setConfirmDelete({ kind: 'item', item })}
                    aria-label="Delete"
                  >
                    ×
                  </button>
                  <button
                    className="admin-mini"
                    disabled={i === items.length - 1}
                    onClick={() => commit(moveItem(tree, item.id, 1))}
                    aria-label="Move later"
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`win-status${save === 'error' ? ' error' : ''}`}>{status}</div>

      {/* A7 */}
      {dialog && (
        <FolderDialog
          tree={tree}
          folder={dialog === 'rename' ? folder : undefined}
          defaultParentId={folderId ?? tree.folders.find(f => f.system)!.id}
          onCancel={() => setDialog(null)}
          onSubmit={(name, parentId) => {
            if (dialog === 'rename' && folder) {
              commit(updateFolder(tree, folder.id, { name, parentId }))
            } else {
              commit(addFolder(tree, parentId, name))
            }
            setDialog(null)
          }}
        />
      )}

      {/* A6 */}
      {infoItem && (
        <ItemInfo
          item={infoItem}
          isCover={folder?.coverItemId === infoItem.id}
          onChange={patch => commit(updateItem(tree, infoItem.id, patch))}
          onSetCover={() => folder && commit(setCover(tree, folder.id, infoItem.id))}
          onDelete={() => {
            setInfoId(null)
            setConfirmDelete({ kind: 'item', item: infoItem })
          }}
          onClose={() => setInfoId(null)}
          uploadFile={uploadFile}
        />
      )}

      {/* A8 */}
      {confirmDelete && (
        <div className="lightbox-share-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="win-dialog" onClick={e => e.stopPropagation()}>
            <p className="win-dialog-title">
              {confirmDelete.kind === 'folder'
                ? `Delete “${confirmDelete.folder.name}”?`
                : 'Delete this photo?'}
            </p>
            <p className="win-dialog-note">
              {confirmDelete.kind === 'folder'
                ? `This also deletes its subfolders and all ${deepItemCount(tree, confirmDelete.folder.id)} items inside. This cannot be undone.`
                : 'It comes off the public site right away. This cannot be undone.'}
            </p>
            <div className="win-dialog-actions">
              <button className="win-btn" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
              <button
                className="win-btn primary"
                onClick={() => {
                  if (confirmDelete.kind === 'folder') {
                    const parent = confirmDelete.folder.parentId
                    commit(deleteFolder(tree, confirmDelete.folder.id))
                    setFolderId(parent)
                  } else {
                    commit(deleteItems(tree, [confirmDelete.item.id]))
                  }
                  setConfirmDelete(null)
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
