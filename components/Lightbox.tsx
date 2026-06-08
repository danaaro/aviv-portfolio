'use client'

import { useEffect, useCallback } from 'react'
import Image from 'next/image'

interface Photo {
  id: string
  src: string
  alt: string
  caption?: string
}

interface LightboxProps {
  photos: Photo[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export default function Lightbox({ photos, index, onClose, onPrev, onNext }: LightboxProps) {
  const photo = photos[index]

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    },
    [onClose, onPrev, onNext]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  if (!photo) return null

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      {/* Close */}
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

      {/* Counter */}
      <div
        style={{
          position: 'fixed',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.5)',
          fontSize: 12,
          letterSpacing: '0.1em',
        }}
      >
        {index + 1} / {photos.length}
      </div>

      {/* Prev */}
      {photos.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); onPrev() }}
          style={{
            position: 'fixed',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            width: 44,
            height: 44,
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
          }}
        >
          ‹
        </button>
      )}

      {/* Image */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 'calc(100vw - 120px)',
          maxHeight: 'calc(100vh - 80px)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {photo.src ? (
          <img
            src={photo.src}
            alt={photo.alt}
            style={{
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 120px)',
              objectFit: 'contain',
              display: 'block',
              borderRadius: 2,
            }}
          />
        ) : (
          <div
            style={{
              width: 600,
              height: 400,
              background: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#444',
              fontSize: 14,
            }}
          >
            Image coming soon
          </div>
        )}
        {photo.caption && (
          <p
            style={{
              marginTop: 12,
              color: 'rgba(255,255,255,0.5)',
              fontSize: 13,
              textAlign: 'center',
            }}
          >
            {photo.caption}
          </p>
        )}
      </div>

      {/* Next */}
      {photos.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); onNext() }}
          style={{
            position: 'fixed',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            width: 44,
            height: 44,
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
          }}
        >
          ›
        </button>
      )}
    </div>
  )
}
