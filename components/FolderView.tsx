'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import Lightbox from './Lightbox'
import FilmDetail, { type Film } from './FilmDetail'

export interface Crumb {
  label: string
  href: string
}

export interface FolderCard {
  id: string
  label: string
  href: string
  thumb?: string
  glyph?: 'about' | 'admin'
  /** e.g. a photo count in the admin, "Folder" in list view */
  meta?: string
}

export interface ItemCard {
  id: string
  kind: 'photo' | 'film'
  title: string
  caption: string
  alt: string
  thumb: string
  youtubeUrl?: string
  /** present when kind === 'film' */
  film?: Film
}

interface FolderViewProps {
  title: string
  /** Root-first, including the current folder. Empty on the home screen. */
  crumbs?: Crumb[]
  folders?: FolderCard[]
  items?: ItemCard[]
  emptyLabel?: string
  /** Extra UI slotted above the grid (the home screen's 3D smiley). */
  children?: React.ReactNode
  /** Status-bar text; defaults to "N items". */
  status?: string
  /** Label each group — "Folders" / "Photos" — the way V6 shows results. */
  grouped?: boolean
}

type ViewMode = 'grid' | 'list'

// The Finder view mode lives in localStorage so it survives navigation. That
// makes it an external store: useSyncExternalStore reads it without a
// post-mount setState, and renders 'grid' on the server so hydration matches.
const VIEW_KEY = 'view_mode'
const viewListeners = new Set<() => void>()
let cachedView: ViewMode | null = null

function subscribeView(onChange: () => void) {
  viewListeners.add(onChange)
  return () => viewListeners.delete(onChange)
}

function readView(): ViewMode {
  cachedView ??= localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid'
  return cachedView
}

function readServerView(): ViewMode {
  return 'grid'
}

function writeView(mode: ViewMode) {
  cachedView = mode
  localStorage.setItem(VIEW_KEY, mode)
  viewListeners.forEach(listener => listener())
}

/**
 * The one recursive folder view behind `/` and `/[...path]` — V1, V2 and V3.
 * Renders child folders as icons, child items as tiles, or both.
 */
export default function FolderView({
  title,
  crumbs = [],
  folders = [],
  items = [],
  emptyLabel = 'Nothing here yet',
  children,
  status,
  grouped = false,
}: FolderViewProps) {
  const router = useRouter()
  const view = useSyncExternalStore(subscribeView, readView, readServerView)
  const [query, setQuery] = useState('')
  const [photoIndex, setPhotoIndex] = useState<number | null>(null)
  const [film, setFilm] = useState<Film | null>(null)

  const photos = items.filter(i => i.kind === 'photo' && !i.youtubeUrl)

  // The open lightbox lives at /p/[id] so the address bar is always shareable
  // and the browser's Back button closes the photo rather than leaving the
  // folder. Closing pops that history entry; popstate is the single place the
  // lightbox state is cleared, so both routes agree.
  useEffect(() => {
    const onPop = () => setPhotoIndex(null)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const openPhoto = (index: number) => {
    const photo = photos[index]
    if (!photo) return
    setPhotoIndex(index)
    window.history.pushState({ lightbox: true }, '', `/p/${photo.id}`)
  }

  const closePhoto = () => {
    if (window.history.state?.lightbox) window.history.back()
    else setPhotoIndex(null)
  }

  const movePhoto = (delta: number) => {
    if (photoIndex === null) return
    const next = (photoIndex + delta + photos.length) % photos.length
    setPhotoIndex(next)
    window.history.replaceState({ lightbox: true }, '', `/p/${photos[next].id}`)
  }

  const openItem = useCallback(
    (item: ItemCard) => {
      if (item.kind === 'film' && item.film) {
        setFilm(item.film)
        return
      }
      if (item.youtubeUrl) {
        window.open(item.youtubeUrl, '_blank', 'noopener')
        return
      }
      const i = photos.findIndex(p => p.id === item.id)
      if (i >= 0) openPhoto(i)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [photos]
  )

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const count = folders.length + items.length
  const backHref = crumbs.length > 1 ? crumbs[crumbs.length - 2].href : '/'

  return (
    <div className="win">
      {/* Title bar */}
      <div className="win-titlebar">
        <span className="win-close" aria-hidden="true" />
        <span className="win-title">{title}</span>
      </div>

      {/* Toolbar — back, breadcrumb, search, view toggle */}
      <div className="win-toolbar">
        {crumbs.length > 0 && (
          <Link href={backHref} className="win-back" aria-label="Back">
            ‹
          </Link>
        )}

        <nav className="win-crumbs" aria-label="Breadcrumb">
          <Link href="/">Aviv Shmuelof</Link>
          {crumbs.map((crumb, i) => (
            <span key={crumb.href}>
              <span className="win-crumb-sep">▸</span>
              {i === crumbs.length - 1 ? (
                <span className="win-crumb-current">{crumb.label}</span>
              ) : (
                <Link href={crumb.href}>{crumb.label}</Link>
              )}
            </span>
          ))}
        </nav>

        <form className="win-search" onSubmit={submitSearch}>
          <SearchIcon />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search photos and folders"
          />
        </form>

        <div className="win-view-toggle">
          <button
            type="button"
            className={`win-view-btn${view === 'grid' ? ' active' : ''}`}
            onClick={() => writeView('grid')}
            aria-label="Icon view"
            aria-pressed={view === 'grid'}
          >
            <GridIcon />
          </button>
          <button
            type="button"
            className={`win-view-btn${view === 'list' ? ' active' : ''}`}
            onClick={() => writeView('list')}
            aria-label="List view"
            aria-pressed={view === 'list'}
          >
            <ListIcon />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="win-body">
        {children}

        {count === 0 ? (
          <p className="win-empty">{emptyLabel}</p>
        ) : view === 'list' ? (
          <div className="folder-list">
            {folders.map(f => (
              <Link key={f.id} href={f.href} className="folder-row">
                <span className="folder-row-thumb">
                  {f.thumb ? <img src={f.thumb} alt="" /> : <Glyph kind={f.glyph} small />}
                </span>
                <span className="folder-row-label">{f.label}</span>
                <span className="folder-row-meta">{f.meta ?? 'Folder'}</span>
              </Link>
            ))}
            {items.map(item => (
              <button key={item.id} className="folder-row" onClick={() => openItem(item)}>
                <span className="folder-row-thumb">
                  {item.thumb && <img src={item.thumb} alt="" />}
                </span>
                <span className="folder-row-label">
                  {item.title || item.caption || item.alt || 'Untitled'}
                </span>
                <span className="folder-row-meta">{item.kind === 'film' ? 'Film' : 'Photo'}</span>
              </button>
            ))}
          </div>
        ) : (
          <>
            {grouped && folders.length > 0 && <p className="win-group">Folders</p>}
            {folders.length > 0 && (
              <div className="folder-grid">
                {folders.map(f => (
                  <Link key={f.id} href={f.href} className="folder-tile">
                    <span className="folder-icon">
                      <span className="folder-icon-tab" />
                      <span className="folder-icon-body">
                        {f.thumb ? (
                          <img src={f.thumb} alt="" className="folder-thumb" />
                        ) : (
                          <Glyph kind={f.glyph} />
                        )}
                      </span>
                    </span>
                    <span className="folder-label">
                      {f.label}
                      {f.meta && <span className="folder-meta">{f.meta}</span>}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {grouped && items.length > 0 && <p className="win-group">Photos</p>}
            {items.length > 0 && (
              <div className={`item-grid${folders.length > 0 && !grouped ? ' spaced' : ''}`}>
                {items.map(item => (
                  <button
                    key={item.id}
                    className={`item-tile${item.kind === 'film' ? ' poster' : ''}`}
                    onClick={() => openItem(item)}
                    aria-label={item.title || item.alt || 'Open'}
                  >
                    {item.thumb ? (
                      <img src={item.thumb} alt={item.alt} loading="lazy" />
                    ) : (
                      <span className="item-tile-blank">
                        {item.kind === 'film' ? 'FILM' : 'PHOTO'}
                      </span>
                    )}

                    {(item.kind === 'film' || item.youtubeUrl) && (
                      <span className="item-play">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    )}

                    {item.kind === 'film' && item.title && (
                      <span className="item-tile-title">{item.title}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Status bar */}
      <div className="win-status">{status ?? `${count} ${count === 1 ? 'item' : 'items'}`}</div>

      {photoIndex !== null && (
        <Lightbox
          photos={photos.map(p => ({
            id: p.id,
            src: p.thumb,
            alt: p.alt,
            title: p.title,
            caption: p.caption,
          }))}
          index={photoIndex}
          folderName={title}
          onClose={closePhoto}
          onPrev={() => movePhoto(-1)}
          onNext={() => movePhoto(1)}
        />
      )}

      {film && <FilmDetail film={film} onClose={() => setFilm(null)} />}
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────

function Glyph({ kind, small }: { kind?: FolderCard['glyph']; small?: boolean }) {
  const size = small ? 18 : 32
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    className: 'folder-glyph',
  }
  if (kind === 'admin') {
    return (
      <svg {...common}>
        <rect x="4" y="10" width="16" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    )
  }
  if (kind === 'about') {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
      </svg>
    )
  }
  // plain folder — the icon chrome already reads as one, so leave it empty
  return null
}

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}
