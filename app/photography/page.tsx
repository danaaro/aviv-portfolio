'use client'

import { useState, useEffect } from 'react'
import Gallery, { Photo } from '@/components/Gallery'
import FolderTabs from '@/components/FolderTabs'

interface PhotoFolder {
  id: string
  name: string
  photos: Photo[]
}

export default function PhotographyPage() {
  const [folders, setFolders] = useState<PhotoFolder[] | null>(null)
  const [active, setActive] = useState('')

  useEffect(() => {
    fetch('/api/admin?action=read')
      .then(res => res.json())
      .then(data => {
        setFolders(data.photography.folders)
        setActive(data.photography.folders[0]?.id ?? '')
      })
  }, [])

  if (folders === null) return null

  if (folders.length === 0) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: '#888', fontSize: 14, letterSpacing: '0.08em' }}>
        No folders yet
      </div>
    )
  }

  const folder = folders.find(f => f.id === active) ?? folders[0]
  const photos: Photo[] = folder.photos

  return (
    <div>
      <FolderTabs folders={folders} active={folder.id} onChange={setActive} />
      <Gallery photos={photos} emptyLabel="Content coming soon" />
    </div>
  )
}
