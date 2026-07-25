'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

const TABS = [
  { label: 'Photography', href: '/photography' },
  { label: 'Cinema', href: '/cinema' },
  { label: 'Commercial', href: '/commercial' },
  { label: 'About', href: '/about' },
]

export default function NavBar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeTab = TABS.find(t => pathname?.startsWith(t.href))

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 70)
      if (window.scrollY <= 70) setOpen(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <>
      {/* ── Full header — scrolls with page ─────────── */}
      <header
        style={{
          position: 'relative',
          background: `
            linear-gradient(180deg, #eeeeee 0%, #dcdcdc 18%, #c8c8c8 42%, #bcbcbc 58%, #ababab 82%, #9e9e9e 100%),
            repeating-linear-gradient(180deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 1px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 3px)
          `,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.75), inset 0 -1px 0 rgba(0,0,0,0.12)',
          borderBottom: '1px solid #888',
          overflow: 'hidden',
        }}
        className="w-full"
      >
        {/* Engraved mark, top right — brushed into the metal, not painted on */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 6,
            right: 18,
            width: 52,
            pointerEvents: 'none',
          }}
        >
          {/* raised edge catching light — bright silver */}
          <img
            src="/crispy-mark.png"
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: 'auto',
              filter: 'invert(1)',
              transform: 'translate(-1.6px, -1.6px)',
              mixBlendMode: 'soft-light',
              opacity: 1,
            }}
          />
          {/* recessed groove shadow — soft gray, not black */}
          <img
            src="/crispy-mark.png"
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: 'auto',
              filter: 'invert(1) brightness(0.55) blur(0.3px)',
              transform: 'translate(1.6px, 1.6px)',
              mixBlendMode: 'multiply',
              opacity: 0.6,
            }}
          />
          {/* base — faint silver tone to ground the shape */}
          <img
            src="/crispy-mark.png"
            alt=""
            style={{
              position: 'relative',
              width: '100%',
              height: 'auto',
              filter: 'invert(1) brightness(0.85)',
              mixBlendMode: 'soft-light',
              opacity: 0.5,
            }}
          />
        </div>

        {/* Name strip */}
        <div className="px-6 pt-4 pb-1">
          <Link
            href="/"
            style={{ color: '#1a1a1a', textDecoration: 'none' }}
            className="text-xl font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            Aviv Shmuelov
          </Link>
        </div>

        {/* Tab bar */}
        <div className="px-4 flex items-end gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`nav-tab${pathname?.startsWith(tab.href) ? ' active' : ''}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </header>

      {/* ── Compact sticky nav — appears on scroll ─── */}
      <div
        ref={dropdownRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: `
            linear-gradient(180deg, #e4e4e4 0%, #d0d0d0 30%, #bcbcbc 65%, #adadad 100%),
            repeating-linear-gradient(180deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 3px)
          `,
          borderBottom: '1px solid #888',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.7)',
          transform: scrolled ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.25s ease',
        }}
      >
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#1a1a1a',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 14 }}>Aviv Shmuelov</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#333' }}>
            {activeTab && <span>{activeTab.label}</span>}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="currentColor"
              style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            >
              <path d="M6 8L1 3h10z" />
            </svg>
          </span>
        </button>

        {open && (
          <div
            style={{
              background: 'linear-gradient(to bottom, #c8c8c8, #b0b0b0)',
              borderTop: '1px solid #aaa',
            }}
          >
            {TABS.map(tab => (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '10px 24px',
                  fontSize: 13,
                  fontWeight: pathname?.startsWith(tab.href) ? 600 : 400,
                  color: pathname?.startsWith(tab.href) ? '#000' : '#333',
                  textDecoration: 'none',
                  borderBottom: '1px solid rgba(0,0,0,0.08)',
                  background: pathname?.startsWith(tab.href) ? 'rgba(255,255,255,0.25)' : 'none',
                  transition: 'background 0.1s',
                }}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
