'use client'

import { useState } from 'react'
import Gallery, { Photo } from '@/components/Gallery'
import photographyData from '@/data/photography.json'

const SECTIONS: { key: SectionKey; label: string; disabled?: boolean }[] = [
  { key: 'army', label: 'Army' },
  { key: 'concerts', label: 'Concerts' },
  { key: 'fashion', label: 'Fashion' },
  { key: 'more', label: 'More', disabled: true },
]

type SectionKey = 'army' | 'concerts' | 'fashion' | 'more'


export default function PhotographyPage() {
  const [active, setActive] = useState<SectionKey>('army')

  const photos: Photo[] = (photographyData[active] as Photo[]) ?? []

  return (
    <div>
      {/* Sub-tab bar */}
      <div
        style={{
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          overflowX: 'auto',
          paddingLeft: 16,
        }}
      >
        {SECTIONS.map(s => (
          <button
            key={s.key}
            onClick={() => !s.disabled && setActive(s.key as SectionKey)}
            className={`sub-tab${active === s.key ? ' active' : ''}${s.disabled ? ' disabled' : ''}`}
          >
            {s.label}
            {s.disabled && (
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 9,
                  letterSpacing: '0.05em',
                  color: '#999',
                }}
              >
                SOON
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Gallery */}
      <Gallery photos={photos} emptyLabel="Content coming soon" />
    </div>
  )
}
