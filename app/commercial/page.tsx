import Gallery, { Photo } from '@/components/Gallery'
import commercialData from '@/data/commercial.json'

export default function CommercialPage() {
  const items = commercialData.items as Photo[]

  return (
    <div>
      <Gallery photos={items} emptyLabel="Content coming soon" />
    </div>
  )
}
