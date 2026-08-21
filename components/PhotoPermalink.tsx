'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Lightbox, { type LightboxPhoto } from './Lightbox'

interface Props {
  photos: LightboxPhoto[]
  startIndex: number
  folderName: string
  folderHref: string
}

/** V4 as a standalone page — the share target for /p/[id]. */
export default function PhotoPermalink({ photos, startIndex, folderName, folderHref }: Props) {
  const router = useRouter()
  const [index, setIndex] = useState(startIndex)

  const move = (next: number) => {
    const i = (next + photos.length) % photos.length
    setIndex(i)
    // Keep the address bar honest as you arrow through the folder.
    window.history.replaceState(null, '', `/p/${photos[i].id}`)
  }

  return (
    <Lightbox
      photos={photos}
      index={index}
      folderName={folderName}
      onClose={() => router.push(folderHref)}
      onPrev={() => move(index - 1)}
      onNext={() => move(index + 1)}
    />
  )
}
