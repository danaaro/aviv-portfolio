'use client'

import { useState } from 'react'
import CinemaCard from '@/components/CinemaCard'
import FolderTabs from '@/components/FolderTabs'
import FilmDetail, { Film } from '@/components/FilmDetail'
import cinemaData from '@/data/cinema.json'

export default function CinemaPage() {
  const folders = cinemaData.folders
  const [active, setActive] = useState(folders[0]?.id ?? '')
  const [selected, setSelected] = useState<Film | null>(null)

  if (folders.length === 0) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: '#888', fontSize: 14, letterSpacing: '0.08em' }}>
        No folders yet
      </div>
    )
  }

  const folder = folders.find(f => f.id === active) ?? folders[0]
  const films = folder.films as Film[]

  return (
    <div>
      <FolderTabs folders={folders} active={folder.id} onChange={setActive} />

      <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
        {films.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: '#888', fontSize: 14, letterSpacing: '0.08em' }}>
            Content coming soon
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '32px 24px',
            }}
          >
            {films.map(film => (
              <CinemaCard key={film.id} film={film} onSelect={setSelected} />
            ))}
          </div>
        )}
      </div>

      {selected && <FilmDetail film={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
