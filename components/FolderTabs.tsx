'use client'

interface FolderTabsProps {
  folders: { id: string; name: string }[]
  active: string
  onChange: (id: string) => void
}

export default function FolderTabs({ folders, active, onChange }: FolderTabsProps) {
  if (folders.length === 0) return null

  return (
    <div
      style={{
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        overflowX: 'auto',
        paddingLeft: 16,
      }}
    >
      {folders.map(f => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`sub-tab${active === f.id ? ' active' : ''}`}
        >
          {f.name}
        </button>
      ))}
    </div>
  )
}
