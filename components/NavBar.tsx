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
          background: 'linear-gradient(to bottom, #d6d6d6 0%, #c2c2c2 60%, #ababab 100%)',
          borderBottom: '1px solid #888',
        }}
        className="w-full"
      >
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
          background: 'linear-gradient(to bottom, #d0d0d0, #b8b8b8)',
          borderBottom: '1px solid #888',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
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
