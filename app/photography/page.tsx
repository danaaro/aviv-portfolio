'use client'

import { useState } from 'react'
import Gallery, { Photo } from '@/components/Gallery'
import FolderTabs from '@/components/FolderTabs'
import photographyData from '@/data/photography.json'

export default function PhotographyPage() {
  const folders = photographyData.folders
  const [active, setActive] = useState(folders[0]?.id ?? '')

  if (folders.length === 0) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: '#888', fontSize: 14, letterSpacing: '0.08em' }}>
        No folders yet
      </div>
    )
  }

  const folder = folders.find(f => f.id === active) ?? folders[0]
  const photos: Photo[] = folder.photos as Photo[]

  return (
    <div>
      <FolderTabs folders={folders} active={folder.id} onChange={setActive} />
      <Gallery photos={photos} emptyLabel="Content coming soon" />
    </div>
  )
}
