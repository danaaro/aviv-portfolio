'use client'

import { useState } from 'react'
import Lightbox from './Lightbox'

export interface Photo {
  id: string
  src: string
  alt: string
  caption?: string
  type?: 'photo' | 'video'
  title?: string
  youtubeUrl?: string
}

interface GalleryProps {
  photos: Photo[]
  emptyLabel?: string
}

export default function Gallery({ photos, emptyLabel = 'Content coming soon' }: GalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const handleClick = (index: number, photo: Photo) => {
    if (photo.type === 'video' && photo.youtubeUrl) {
      window.open(photo.youtubeUrl, '_blank', 'noopener')
    } else {
      setLightboxIndex(index)
    }
  }

  if (photos.length === 0) {
    return (
      <div
        style={{
          padding: '80px 20px',
          textAlign: 'center',
          color: '#888',
          fontSize: 14,
          letterSpacing: '0.08em',
        }}
      >
        {emptyLabel}
      </div>
    )
  }

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2px',
          padding: '2px',
        }}
      >
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            onClick={() => handleClick(i, photo)}
            style={{
              position: 'relative',
              aspectRatio: '4/3',
              overflow: 'hidden',
              cursor: 'pointer',
              background: '#161616',
            }}
            className="group"
          >
            {photo.src ? (
              <img
                src={photo.src}
                alt={photo.alt}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.4s ease, filter 0.3s ease',
                }}
                className="group-hover:scale-[1.03] group-hover:brightness-90"
                loading="lazy"
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#333',
                  fontSize: 12,
                  letterSpacing: '0.1em',
                }}
              >
                PHOTO
              </div>
            )}

            {/* Video play icon overlay */}
            {photo.type === 'video' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.3)',
                  transition: 'background 0.2s',
                }}
                className="group-hover:bg-black/40"
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255,255,255,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Hover overlay for photos */}
            {photo.type !== 'video' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0)',
                  transition: 'background 0.25s',
                }}
                className="group-hover:bg-black/20"
              />
            )}
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos.filter(p => p.type !== 'video')}
          index={
            (() => {
              const photoOnlyPhotos = photos.filter(p => p.type !== 'video')
              const clickedPhoto = photos[lightboxIndex]
              return photoOnlyPhotos.findIndex(p => p.id === clickedPhoto.id)
            })()
          }
          onClose={() => setLightboxIndex(null)}
          onPrev={() => {
            const photoOnly = photos.filter(p => p.type !== 'video')
            const clickedPhoto = photos[lightboxIndex]
            const idx = photoOnly.findIndex(p => p.id === clickedPhoto.id)
            const prevIdx = (idx - 1 + photoOnly.length) % photoOnly.length
            const prevId = photoOnly[prevIdx].id
            setLightboxIndex(photos.findIndex(p => p.id === prevId))
          }}
          onNext={() => {
            const photoOnly = photos.filter(p => p.type !== 'video')
            const clickedPhoto = photos[lightboxIndex]
            const idx = photoOnly.findIndex(p => p.id === clickedPhoto.id)
            const nextIdx = (idx + 1) % photoOnly.length
            const nextId = photoOnly[nextIdx].id
            setLightboxIndex(photos.findIndex(p => p.id === nextId))
          }}
        />
      )}
    </>
  )
}
