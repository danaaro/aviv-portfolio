import type { Metadata } from 'next'
import Link from 'next/link'
import ContactList, { CONTACT_EMAIL } from '@/components/ContactList'

export const metadata: Metadata = {
  title: 'About — Aviv Shmuelof',
  description: 'Filmmaker, photographer, and visual artist based in Modi’in, Israel.',
}

/** V7 — a leaf page rather than a folder. */
export default function AboutPage() {
  return (
    <div className="win">
      <div className="win-titlebar">
        <span className="win-close" aria-hidden="true" />
        <span className="win-title">About</span>
      </div>

      <div className="win-toolbar">
        <Link href="/" className="win-back" aria-label="Back">
          ‹
        </Link>
        <nav className="win-crumbs" aria-label="Breadcrumb">
          <Link href="/">Aviv Shmuelof</Link>
          <span>
            <span className="win-crumb-sep">▸</span>
            <span className="win-crumb-current">About</span>
          </span>
        </nav>
      </div>

      <div className="win-body">
        <div className="leaf">
          <h1 className="leaf-title">Aviv Shmuelof</h1>

          <div className="leaf-prose">
            <p>
              Aviv Shmuelof is a filmmaker, photographer, and visual artist based in Modi&apos;in,
              Israel.
            </p>
            <p>
              Trained in Film &amp; Television Engineering at ORT Psgot College, Aviv spent three
              years as an operational combat photographer in the Israeli Navy.
            </p>
            <p>
              Before and beyond his military service, he built his creative life deliberately:
              archiving rare films at the Jerusalem Cinematheque, working the Jerusalem Film Festival
              for four seasons, founding an independent fashion brand (Crispy), and producing
              original video content under his own production banner, Peak Productions.
            </p>
            <p>
              His work lives at the intersection of documentary instinct, cinematic vision, and
              fashion sensibility — shaped by years of shooting under pressure, in the field, with no
              margin for error.
            </p>
          </div>

          <div className="leaf-rule" />

          <h2 className="leaf-heading">Contact</h2>
          <ContactList />
        </div>
      </div>

      <div className="win-status">{CONTACT_EMAIL}</div>
    </div>
  )
}
