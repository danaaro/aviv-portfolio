'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

const Smiley3D = dynamic(() => import('./Smiley3D'), { ssr: false })

type ViewMode = 'grid' | 'list'

interface FolderItem {
  label: string
  href: string
  thumb?: string
  glyph?: 'about' | 'admin'
}

interface Thumbs {
  photography?: string
  cinema?: string
  commercial?: string
}

export default function Desktop() {
  const [query, setQuery] = useState('')
  const [view, setView] = useState<ViewMode>('grid')
  const [thumbs, setThumbs] = useState<Thumbs>({})

  useEffect(() => {
    fetch('/api/admin?action=read')
      .then(res => res.json())
      .then(data => {
        setThumbs({
          photography: data.photography.folders?.[0]?.photos?.[0]?.src,
          cinema: data.cinema.folders?.[0]?.films?.[0]?.posterSrc,
          commercial: data.commercial.folders?.[0]?.items?.[0]?.src,
        })
      })
  }, [])

  const FOLDERS: FolderItem[] = [
    { label: 'Photography', href: '/photography', thumb: thumbs.photography },
    { label: 'Cinema', href: '/cinema', thumb: thumbs.cinema },
    { label: 'Commercial', href: '/commercial', thumb: thumbs.commercial },
    { label: 'About', href: '/about', glyph: 'about' },
    { label: 'Admin', href: '/admin', glyph: 'admin' },
  ]

  const filtered = FOLDERS.filter(f =>
    f.label.toLowerCase().includes(query.trim().toLowerCase())
  )

  return (
    <div className="desktop-shell">
      {/* Spinning 3D smiley */}
      <div className="smiley-stage">
        <div className="smiley-canvas-wrap">
          <Smiley3D />
        </div>
      </div>

      {/* Toolbar */}
      <div className="desktop-toolbar">
        <div className="desktop-toolbar-title">Aviv Shmuelov</div>
        <div className="desktop-toolbar-row">
          <div className="desktop-filter">
            <SearchIcon />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Filter"
              aria-label="Filter folders"
            />
          </div>
          <div className="desktop-view-toggle">
            <button
              type="button"
              className={`desktop-view-btn${view === 'grid' ? ' active' : ''}`}
              onClick={() => setView('grid')}
              aria-label="Grid view"
            >
              <GridIcon />
            </button>
            <button
              type="button"
              className={`desktop-view-btn${view === 'list' ? ' active' : ''}`}
              onClick={() => setView('list')}
              aria-label="List view"
            >
              <ListIcon />
            </button>
          </div>
          <div className="desktop-status">
            <HomeIcon />
            <span>{filtered.length} Items</span>
          </div>
        </div>
      </div>

      {/* Folders */}
      {filtered.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', fontSize: 13, marginTop: 40 }}>
          No matches for &ldquo;{query}&rdquo;
        </p>
      ) : view === 'grid' ? (
        <div className="folder-grid">
          {filtered.map(f => (
            <Link key={f.href} href={f.href} className="folder-tile">
              <div className="folder-icon">
                <div className="folder-icon-tab" />
                <div className="folder-icon-body">
                  {f.thumb ? (
                    <img src={f.thumb} alt="" className="folder-thumb" />
                  ) : f.glyph === 'admin' ? (
                    <LockIcon />
                  ) : (
                    <PersonIcon />
                  )}
                </div>
              </div>
              <span className="folder-label">{f.label}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="folder-list">
          {filtered.map(f => (
            <Link key={f.href} href={f.href} className="folder-row">
              <div className="folder-row-thumb">
                {f.thumb ? (
                  <img src={f.thumb} alt="" />
                ) : f.glyph === 'admin' ? (
                  <LockIcon />
                ) : (
                  <PersonIcon />
                )}
              </div>
              <span className="folder-row-label">{f.label}</span>
              <span className="folder-row-meta">Folder</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#555', flex: 'none' }}>
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

function HomeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m3 11 9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="folder-glyph">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="folder-glyph">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  )
}
