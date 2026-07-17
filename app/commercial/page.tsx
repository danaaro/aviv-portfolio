'use client'

import { useState } from 'react'
import Gallery, { Photo } from '@/components/Gallery'
import FolderTabs from '@/components/FolderTabs'
import commercialData from '@/data/commercial.json'

export default function CommercialPage() {
  const folders = commercialData.folders
  const [active, setActive] = useState(folders[0]?.id ?? '')

  if (folders.length === 0) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: '#888', fontSize: 14, letterSpacing: '0.08em' }}>
        No folders yet
      </div>
    )
  }

  const folder = folders.find(f => f.id === active) ?? folders[0]
  const items: Photo[] = folder.items as Photo[]

  return (
    <div>
      <FolderTabs folders={folders} active={folder.id} onChange={setActive} />
      <Gallery photos={items} emptyLabel="Content coming soon" />
    </div>
  )
}
