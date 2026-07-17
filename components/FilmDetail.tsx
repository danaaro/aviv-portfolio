'use client'

import { useEffect, useCallback, useState } from 'react'
import { getEmbedUrl } from '@/lib/video'
import Lightbox from './Lightbox'

interface Still {
  id: string
  src: string
  caption?: string
}

export interface Film {
  id: string
  title: string
  duration?: string
  year?: number
  posterSrc: string
  videoUrl?: string
  description?: string
  director?: string
  producer?: string
  cinematographer?: string
  editor?: string
  productionCompany?: string
  awards?: string[]
  stills?: Still[]
}

interface FilmDetailProps {
  film: Film
  onClose: () => void
}

export default function FilmDetail({ film, onClose }: FilmDetailProps) {
  const [stillIndex, setStillIndex] = useState<number | null>(null)
  const embed = film.videoUrl ? getEmbedUrl(film.videoUrl) : null
  const stills = film.stills ?? []

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stillIndex === null) onClose()
    },
    [onClose, stillIndex]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  const credits: { label: string; value: string }[] = [
    { label: 'Year', value: film.year ? String(film.year) : '' },
    { label: 'Duration', value: film.duration ?? '' },
    { label: 'Director', value: film.director ?? '' },
    { label: 'Producer', value: film.producer ?? '' },
    { label: 'Cinematographer', value: film.cinematographer ?? '' },
    { label: 'Editor', value: film.editor ?? '' },
    { label: 'Production Company', value: film.productionCompany ?? '' },
  ].filter(c => c.value)

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      style={{ alignItems: 'flex-start', overflowY: 'auto', padding: '48px 20px' }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 20,
          right: 24,
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: 28,
          cursor: 'pointer',
          lineHeight: 1,
          opacity: 0.7,
          zIndex: 10001,
          padding: '4px 8px',
        }}
      >
        ×
      </button>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 1100,
          width: '100%',
          margin: '0 auto',
          background: '#141414',
          borderRadius: 6,
          overflow: 'hidden',
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        {/* Main: video/poster + stills strip */}
        <div style={{ flex: '1 1 640px', minWidth: 0 }}>
          <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000' }}>
            {embed ? (
              <iframe
                src={embed.embedSrc}
                title={film.title}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              />
            ) : film.posterSrc ? (
              <img
                src={film.posterSrc}
                alt={film.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: 13 }}>
                No video yet
              </div>
            )}
          </div>

          {stills.length > 0 && (
            <div style={{ display: 'flex', gap: 8, padding: 12, overflowX: 'auto' }}>
              {stills.map((s, i) => (
                <img
                  key={s.id}
                  src={s.src}
                  alt={s.caption ?? ''}
                  onClick={() => setStillIndex(i)}
                  style={{
                    width: 108,
                    height: 72,
                    objectFit: 'cover',
                    borderRadius: 3,
                    cursor: 'pointer',
                    flex: 'none',
                    opacity: 0.9,
                    transition: 'opacity 0.15s',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: credits */}
        <div style={{ flex: '0 0 280px', padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#f0f0f0', marginBottom: 4 }}>
            {film.title}
          </h2>

          {credits.map(c => (
            <div key={c.label} style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>
                {c.label}
              </div>
              <div style={{ fontSize: 13, color: '#eee', marginTop: 2 }}>{c.value}</div>
            </div>
          ))}

          {film.awards && film.awards.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>
                Awards
              </div>
              <ul style={{ marginTop: 4, paddingLeft: 16 }}>
                {film.awards.map((a, i) => (
                  <li key={i} style={{ fontSize: 13, color: '#eee', marginBottom: 4 }}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {film.description && (
            <div style={{ marginTop: 18, fontSize: 13, lineHeight: 1.6, color: '#bbb' }}>
              {film.description}
            </div>
          )}
        </div>
      </div>

      {stillIndex !== null && (
        <Lightbox
          photos={stills.map(s => ({ id: s.id, src: s.src, alt: film.title, caption: s.caption }))}
          index={stillIndex}
          onClose={() => setStillIndex(null)}
          onPrev={() => setStillIndex(i => (i === null ? null : (i - 1 + stills.length) % stills.length))}
          onNext={() => setStillIndex(i => (i === null ? null : (i + 1) % stills.length))}
        />
      )}
    </div>
  )
}
