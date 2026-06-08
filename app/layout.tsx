import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/NavBar'

export const metadata: Metadata = {
  title: 'Aviv Shmuelov',
  description: 'Filmmaker, photographer, and visual artist.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NavBar />
        <main style={{ flex: 1 }}>{children}</main>
      </body>
    </html>
  )
}
