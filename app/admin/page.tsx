import type { Metadata } from 'next'
import AdminApp from '@/components/admin/AdminApp'
import SignIn from '@/components/admin/SignIn'
import { loadTree } from '@/lib/content'
import { currentAdmin } from '@/lib/session'

export const dynamic = 'force-dynamic'

// Unlisted URL, and kept out of search results.
export const metadata: Metadata = {
  title: 'Admin — Aviv Shmuelof',
  robots: { index: false, follow: false },
}

/**
 * A1 — sign in, gated server-side. The tree is only ever sent to the browser
 * once a valid session cookie is present.
 */
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const user = await currentAdmin()
  if (!user) {
    const { error } = await searchParams
    return <SignIn oauthError={error} />
  }

  const { tree, source } = await loadTree()
  return <AdminApp initialTree={tree} user={user} readOnly={source === 'error'} />
}
