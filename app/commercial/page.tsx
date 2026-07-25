'use client'

import { useState, useEffect } from 'react'
import Gallery, { Photo } from '@/components/Gallery'
import FolderTabs from '@/components/FolderTabs'

interface CommercialFolder {
  id: string
  name: string
  items: Photo[]
}

export default function CommercialPage() {
  const [folders, setFolders] = useState<CommercialFolder[] | null>(null)
  const [active, setActive] = useState('')

  useEffect(() => {
    fetch('/api/admin?action=read')
      .then(res => res.json())
      .then(data => {
        setFolders(data.commercial.folders)
        setActive(data.commercial.folders[0]?.id ?? '')
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
  const items: Photo[] = folder.items

  return (
    <div>
      <FolderTabs folders={folders} active={folder.id} onChange={setActive} />
      <Gallery photos={items} emptyLabel="Content coming soon" />
    </div>
  )
}
