'use client'

import { useState, useEffect, useRef } from 'react'

type Section = 'photography' | 'cinema' | 'commercial'

interface FolderBase {
  id: string
  name: string
}

interface PhotoItem {
  id: string
  src: string
  alt: string
  caption?: string
}

interface PhotographyFolder extends FolderBase {
  photos: PhotoItem[]
}

interface StillItem {
  id: string
  src: string
  caption: string
}

interface FilmItem {
  id: string
  title: string
  duration: string
  year?: number
  posterSrc: string
  videoUrl: string
  description: string
  director: string
  producer: string
  cinematographer: string
  editor: string
  productionCompany: string
  awards: string[]
  stills: StillItem[]
}

interface CinemaFolder extends FolderBase {
  films: FilmItem[]
}

interface CommercialItem {
  id: string
  type: 'photo' | 'video'
  src: string
  alt: string
  title?: string
  youtubeUrl?: string
}

interface CommercialFolder extends FolderBase {
  items: CommercialItem[]
}

interface AdminData {
  photography: { folders: PhotographyFolder[] }
  cinema: { folders: CinemaFolder[] }
  commercial: { folders: CommercialFolder[] }
}

// ── Helpers ───────────────────────────────────────────

const S: React.CSSProperties = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
  WebkitFontSmoothing: 'antialiased',
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>
      {children}
    </label>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        padding: '8px 12px',
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: 4,
        color: '#f0f0f0',
        fontSize: 13,
        outline: 'none',
        ...props.style,
      }}
    />
  )
}

function Btn({
  children,
  onClick,
  variant = 'default',
  type = 'button',
  style,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'danger' | 'primary'
  type?: 'button' | 'submit'
  style?: React.CSSProperties
}) {
  const colors = {
    default: { bg: '#2a2a2a', color: '#e0e0e0', border: '#3a3a3a' },
    danger: { bg: '#3a1a1a', color: '#ff6b6b', border: '#5a2a2a' },
    primary: { bg: '#1a3a2a', color: '#4ade80', border: '#2a5a3a' },
  }
  const c = colors[variant]
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        padding: '7px 14px',
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        borderRadius: 4,
        fontSize: 12,
        cursor: 'pointer',
        letterSpacing: '0.02em',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

// ── Folder picker (shared across all 3 sections) ─────

function FolderPicker({
  folders,
  activeId,
  onSelect,
  onAdd,
  onDelete,
}: {
  folders: FolderBase[]
  activeId: string
  onSelect: (id: string) => void
  onAdd: (name: string) => void
  onDelete: (id: string) => void
}) {
  const [newName, setNewName] = useState('')

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {folders.map(f => (
          <div key={f.id} style={{ display: 'flex', alignItems: 'stretch' }}>
            <Btn
              onClick={() => onSelect(f.id)}
              style={{
                background: activeId === f.id ? '#3a3a3a' : '#1e1e1e',
                borderColor: activeId === f.id ? '#555' : '#2a2a2a',
                borderRadius: '4px 0 0 4px',
              }}
            >
              {f.name}
            </Btn>
            <button
              onClick={() => onDelete(f.id)}
              title="Delete folder"
              style={{
                background: '#1e1e1e',
                border: '1px solid #2a2a2a',
                borderLeft: 'none',
                borderRadius: '0 4px 4px 0',
                color: '#ff6b6b',
                cursor: 'pointer',
                width: 26,
                fontSize: 13,
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && newName.trim()) {
              onAdd(newName.trim())
              setNewName('')
            }
          }}
          placeholder="New folder name"
          style={{ maxWidth: 220 }}
        />
        <Btn
          variant="primary"
          onClick={() => {
            if (newName.trim()) {
              onAdd(newName.trim())
              setNewName('')
            }
          }}
        >
          + Add Folder
        </Btn>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [section, setSection] = useState<Section>('photography')
  const [activeFolders, setActiveFolders] = useState<Record<Section, string>>({
    photography: '',
    cinema: '',
    commercial: '',
  })
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_authed')
      if (saved === 'true') setAuthed(true)
    }
  }, [])

  const login = async () => {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'auth', password: pw }),
    })
    if (res.ok) {
      localStorage.setItem('admin_authed', 'true')
      localStorage.setItem('admin_pw', pw)
      setAuthed(true)
    } else {
      setPwError('Wrong password')
    }
  }

  const loadData = async () => {
    setLoading(true)
    const res = await fetch('/api/admin?action=read')
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    if (authed) loadData()
  }, [authed])

  const showMsg = (m: string) => {
    setMsg(m)
    setTimeout(() => setMsg(''), 3000)
  }

  const save = async (body: object) => {
    const storedPw = typeof window !== 'undefined' ? localStorage.getItem('admin_pw') ?? '' : ''
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: storedPw, ...body }),
    })
    if (res.ok) {
      showMsg('Saved')
      loadData()
    } else {
      showMsg('Error saving')
    }
  }

  const saveFolders = (sec: Section, folders: FolderBase[]) => {
    save({ action: 'update', section: sec, key: 'folders', data: folders })
  }

  const addFolder = (sec: Section, name: string) => {
    if (!data) return
    const blankExtra = sec === 'photography' ? { photos: [] } : sec === 'cinema' ? { films: [] } : { items: [] }
    const newFolder = { id: Date.now().toString(), name, ...blankExtra }
    const current = data[sec].folders as FolderBase[]
    saveFolders(sec, [...current, newFolder])
  }

  const deleteFolder = (sec: Section, folderId: string) => {
    if (!data) return
    if (!window.confirm('Delete this folder and everything inside it? This cannot be undone.')) return
    const current = data[sec].folders as FolderBase[]
    saveFolders(sec, current.filter(f => f.id !== folderId))
  }

  const setActiveFolder = (sec: Section, id: string) => {
    setActiveFolders(prev => ({ ...prev, [sec]: id }))
  }

  // ── Password screen ──────────────────────────────

  if (!authed) {
    return (
      <div
        style={{
          ...S,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d0d0d',
        }}
      >
        <div
          style={{
            width: 320,
            background: '#161616',
            border: '1px solid #2a2a2a',
            borderRadius: 8,
            padding: 32,
          }}
        >
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#f0f0f0', marginBottom: 24 }}>
            Admin
          </h1>
          <Label>Password</Label>
          <Input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setPwError('') }}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Enter password"
            style={{ marginBottom: 16 }}
          />
          {pwError && (
            <p style={{ color: '#ff6b6b', fontSize: 12, marginBottom: 12 }}>{pwError}</p>
          )}
          <Btn variant="primary" onClick={login} style={{ width: '100%', textAlign: 'center' }}>
            Enter
          </Btn>
        </div>
      </div>
    )
  }

  // ── Admin panel ──────────────────────────────────

  return (
    <div style={{ ...S, background: '#0d0d0d', minHeight: '100vh', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#f0f0f0' }}>Content Manager</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {msg && <span style={{ fontSize: 12, color: '#4ade80' }}>{msg}</span>}
          <Btn onClick={() => { localStorage.removeItem('admin_authed'); setAuthed(false) }} variant="danger">
            Sign out
          </Btn>
        </div>
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #2a2a2a', paddingBottom: 0 }}>
        {(['photography', 'cinema', 'commercial'] as Section[]).map(s => (
          <button
            key={s}
            onClick={() => setSection(s)}
            style={{
              padding: '8px 16px',
              background: section === s ? '#2a2a2a' : 'none',
              border: 'none',
              borderBottom: section === s ? '2px solid #f0f0f0' : '2px solid transparent',
              color: section === s ? '#f0f0f0' : '#555',
              fontSize: 13,
              cursor: 'pointer',
              textTransform: 'capitalize',
              marginBottom: -1,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#555', fontSize: 13 }}>Loading…</p>
      ) : (
        <>
          {section === 'photography' && data && (
            <PhotographyAdmin
              folders={data.photography.folders}
              activeFolderId={activeFolders.photography || data.photography.folders[0]?.id || ''}
              onFolderChange={id => setActiveFolder('photography', id)}
              onAddFolder={name => addFolder('photography', name)}
              onDeleteFolder={id => deleteFolder('photography', id)}
              onSave={folders => saveFolders('photography', folders)}
            />
          )}
          {section === 'cinema' && data && (
            <CinemaAdmin
              folders={data.cinema.folders}
              activeFolderId={activeFolders.cinema || data.cinema.folders[0]?.id || ''}
              onFolderChange={id => setActiveFolder('cinema', id)}
              onAddFolder={name => addFolder('cinema', name)}
              onDeleteFolder={id => deleteFolder('cinema', id)}
              onSave={folders => saveFolders('cinema', folders)}
            />
          )}
          {section === 'commercial' && data && (
            <CommercialAdmin
              folders={data.commercial.folders}
              activeFolderId={activeFolders.commercial || data.commercial.folders[0]?.id || ''}
              onFolderChange={id => setActiveFolder('commercial', id)}
              onAddFolder={name => addFolder('commercial', name)}
              onDeleteFolder={id => deleteFolder('commercial', id)}
              onSave={folders => saveFolders('commercial', folders)}
            />
          )}
        </>
      )}
    </div>
  )
}

// ── Photography Admin ────────────────────────────────

function PhotographyAdmin({
  folders,
  activeFolderId,
  onFolderChange,
  onAddFolder,
  onDeleteFolder,
  onSave,
}: {
  folders: PhotographyFolder[]
  activeFolderId: string
  onFolderChange: (id: string) => void
  onAddFolder: (name: string) => void
  onDeleteFolder: (id: string) => void
  onSave: (folders: PhotographyFolder[]) => void
}) {
  const [newSrc, setNewSrc] = useState('')
  const [newAlt, setNewAlt] = useState('')
  const [newCaption, setNewCaption] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const folder = folders.find(f => f.id === activeFolderId) ?? folders[0]
  const photos = folder?.photos ?? []

  const updatePhotos = (newPhotos: PhotoItem[]) => {
    if (!folder) return
    onSave(folders.map(f => (f.id === folder.id ? { ...f, photos: newPhotos } : f)))
  }

  const addPhoto = () => {
    if (!folder) return
    if (!newSrc && !newAlt) return
    updatePhotos([...photos, { id: Date.now().toString(), src: newSrc, alt: newAlt, caption: newCaption }])
    setNewSrc('')
    setNewAlt('')
    setNewCaption('')
  }

  const removePhoto = (id: string) => {
    updatePhotos(photos.filter(p => p.id !== id))
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    if (res.ok) {
      const { url } = await res.json()
      setNewSrc(url)
    }
  }

  return (
    <div>
      <FolderPicker
        folders={folders}
        activeId={folder?.id ?? ''}
        onSelect={onFolderChange}
        onAdd={onAddFolder}
        onDelete={onDeleteFolder}
      />

      {!folder ? (
        <p style={{ color: '#555', fontSize: 13 }}>Create a folder to get started.</p>
      ) : (
        <>
          {/* Current photos */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 12,
              marginBottom: 32,
            }}
          >
            {photos.map(photo => (
              <div key={photo.id} style={{ position: 'relative' }}>
                <div style={{ aspectRatio: '4/3', background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                  {photo.src && (
                    <img src={photo.src} alt={photo.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <p style={{ fontSize: 11, color: '#666', marginTop: 4, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {photo.alt || photo.id}
                </p>
                <button
                  onClick={() => removePhoto(photo.id)}
                  style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#ff6b6b', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 14, lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Add photo */}
          <div style={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: 6, padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 500, color: '#f0f0f0', marginBottom: 16 }}>Add Photo</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <Label>Upload file</Label>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
                <Btn onClick={() => fileRef.current?.click()}>Choose File</Btn>
                {newSrc && <p style={{ fontSize: 11, color: '#4ade80', marginTop: 6 }}>✓ {newSrc}</p>}
              </div>
              <div>
                <Label>Or Image URL</Label>
                <Input value={newSrc} onChange={e => setNewSrc(e.target.value)} placeholder="https://…" />
              </div>
              <div>
                <Label>Alt text</Label>
                <Input value={newAlt} onChange={e => setNewAlt(e.target.value)} placeholder="Describe the image" />
              </div>
              <div>
                <Label>Caption (optional)</Label>
                <Input value={newCaption} onChange={e => setNewCaption(e.target.value)} placeholder="Caption" />
              </div>
              <Btn variant="primary" onClick={addPhoto}>Add Photo</Btn>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Cinema Admin ─────────────────────────────────────

function CinemaAdmin({
  folders,
  activeFolderId,
  onFolderChange,
  onAddFolder,
  onDeleteFolder,
  onSave,
}: {
  folders: CinemaFolder[]
  activeFolderId: string
  onFolderChange: (id: string) => void
  onAddFolder: (name: string) => void
  onDeleteFolder: (id: string) => void
  onSave: (folders: CinemaFolder[]) => void
}) {
  const blank = {
    id: '', title: '', duration: '', year: new Date().getFullYear(), posterSrc: '',
    videoUrl: '', description: '', director: '', producer: '', cinematographer: '',
    editor: '', productionCompany: '', awards: [] as string[], stills: [] as StillItem[],
  }
  const [form, setForm] = useState({ ...blank })
  const [newAward, setNewAward] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const stillRef = useRef<HTMLInputElement>(null)

  const folder = folders.find(f => f.id === activeFolderId) ?? folders[0]
  const films = folder?.films ?? []

  const setField = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const updateFilms = (newFilms: FilmItem[]) => {
    if (!folder) return
    onSave(folders.map(f => (f.id === folder.id ? { ...f, films: newFilms } : f)))
  }

  const add = () => {
    if (!folder || !form.title) return
    updateFilms([...films, { ...form, id: Date.now().toString() }])
    setForm({ ...blank })
  }

  const remove = (id: string) => {
    updateFilms(films.filter(f => f.id !== id))
  }

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (res.ok) { const { url } = await res.json(); setField('posterSrc', url) }
  }

  const handleStillUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (res.ok) {
      const { url } = await res.json()
      setField('stills', [...form.stills, { id: Date.now().toString(), src: url, caption: '' }])
    }
    if (stillRef.current) stillRef.current.value = ''
  }

  const removeStill = (id: string) => setField('stills', form.stills.filter(s => s.id !== id))

  const addAward = () => {
    if (!newAward.trim()) return
    setField('awards', [...form.awards, newAward.trim()])
    setNewAward('')
  }
  const removeAward = (i: number) => setField('awards', form.awards.filter((_, idx) => idx !== i))

  return (
    <div>
      <FolderPicker
        folders={folders}
        activeId={folder?.id ?? ''}
        onSelect={onFolderChange}
        onAdd={onAddFolder}
        onDelete={onDeleteFolder}
      />

      {!folder ? (
        <p style={{ color: '#555', fontSize: 13 }}>Create a folder to get started.</p>
      ) : (
        <>
          {/* Film list */}
          <div style={{ display: 'grid', gap: 12, marginBottom: 32 }}>
            {films.map(film => (
              <div key={film.id} style={{ display: 'flex', gap: 12, background: '#161616', border: '1px solid #2a2a2a', borderRadius: 6, padding: 12, alignItems: 'center' }}>
                <div style={{ width: 50, height: 75, background: '#1a1a1a', borderRadius: 3, flexShrink: 0, overflow: 'hidden' }}>
                  {film.posterSrc && <img src={film.posterSrc} alt={film.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#f0f0f0', marginBottom: 3 }}>{film.title}</p>
                  <p style={{ fontSize: 11, color: '#555' }}>{[film.year, film.duration].filter(Boolean).join(' · ')}</p>
                  {(film.director || film.producer) && (
                    <p style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                      {[film.director && `Dir. ${film.director}`, film.producer && `Prod. ${film.producer}`].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {film.videoUrl && <p style={{ fontSize: 10, color: '#4ade80', marginTop: 2 }}>Video ✓</p>}
                </div>
                <Btn variant="danger" onClick={() => remove(film.id)}>Remove</Btn>
              </div>
            ))}
          </div>

          {/* Add film */}
          <div style={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: 6, padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 500, color: '#f0f0f0', marginBottom: 16 }}>Add Film</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label>Title</Label>
                <Input value={form.title} onChange={e => setField('title', e.target.value)} placeholder="Film title" />
              </div>
              <div>
                <Label>Duration</Label>
                <Input value={form.duration} onChange={e => setField('duration', e.target.value)} placeholder="12:30" />
              </div>
              <div>
                <Label>Year</Label>
                <Input type="number" value={form.year} onChange={e => setField('year', Number(e.target.value))} />
              </div>

              <div>
                <Label>Director</Label>
                <Input value={form.director} onChange={e => setField('director', e.target.value)} placeholder="Director name" />
              </div>
              <div>
                <Label>Producer</Label>
                <Input value={form.producer} onChange={e => setField('producer', e.target.value)} placeholder="Producer name" />
              </div>
              <div>
                <Label>Cinematographer</Label>
                <Input value={form.cinematographer} onChange={e => setField('cinematographer', e.target.value)} placeholder="Cinematographer name" />
              </div>
              <div>
                <Label>Editor</Label>
                <Input value={form.editor} onChange={e => setField('editor', e.target.value)} placeholder="Editor name" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label>Production Company</Label>
                <Input value={form.productionCompany} onChange={e => setField('productionCompany', e.target.value)} placeholder="e.g. Peak Productions" />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <Label>Video URL (YouTube or Vimeo)</Label>
                <Input value={form.videoUrl} onChange={e => setField('videoUrl', e.target.value)} placeholder="https://youtube.com/watch?v=… or https://vimeo.com/…" />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <Label>Description</Label>
                <Input value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Synopsis" />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <Label>Poster</Label>
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePosterUpload} style={{ display: 'none' }} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Btn onClick={() => fileRef.current?.click()}>Upload Poster</Btn>
                  {form.posterSrc && <span style={{ fontSize: 11, color: '#4ade80' }}>✓ uploaded</span>}
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label>Or Poster URL</Label>
                <Input value={form.posterSrc} onChange={e => setField('posterSrc', e.target.value)} placeholder="https://…" />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <Label>Awards / Prizes</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                  {form.awards.map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ flex: 1, fontSize: 12, color: '#eee', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 4, padding: '6px 10px' }}>
                        {a}
                      </span>
                      <button
                        onClick={() => removeAward(i)}
                        style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: 14 }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input
                    value={newAward}
                    onChange={e => setNewAward(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addAward()}
                    placeholder="e.g. Best Short Film — Jerusalem Film Festival 2023"
                  />
                  <Btn onClick={addAward}>Add</Btn>
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <Label>Stills</Label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8, marginBottom: 8 }}>
                  {form.stills.map(s => (
                    <div key={s.id} style={{ position: 'relative' }}>
                      <div style={{ aspectRatio: '4/3', background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                        <img src={s.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <button
                        onClick={() => removeStill(s.id)}
                        style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#ff6b6b', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 11, lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <input ref={stillRef} type="file" accept="image/*" onChange={handleStillUpload} style={{ display: 'none' }} />
                <Btn onClick={() => stillRef.current?.click()}>Add Still</Btn>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <Btn variant="primary" onClick={add}>Add Film</Btn>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Commercial Admin ─────────────────────────────────

function CommercialAdmin({
  folders,
  activeFolderId,
  onFolderChange,
  onAddFolder,
  onDeleteFolder,
  onSave,
}: {
  folders: CommercialFolder[]
  activeFolderId: string
  onFolderChange: (id: string) => void
  onAddFolder: (name: string) => void
  onDeleteFolder: (id: string) => void
  onSave: (folders: CommercialFolder[]) => void
}) {
  const [form, setForm] = useState({ type: 'photo' as 'photo' | 'video', src: '', alt: '', title: '', youtubeUrl: '' })
  const fileRef = useRef<HTMLInputElement>(null)

  const folder = folders.find(f => f.id === activeFolderId) ?? folders[0]
  const items = folder?.items ?? []

  const setField = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const updateItems = (newItems: CommercialItem[]) => {
    if (!folder) return
    onSave(folders.map(f => (f.id === folder.id ? { ...f, items: newItems } : f)))
  }

  const add = () => {
    if (!folder) return
    if (!form.src && !form.title) return
    updateItems([...items, { ...form, id: Date.now().toString() }])
    setForm({ type: 'photo', src: '', alt: '', title: '', youtubeUrl: '' })
  }

  const remove = (id: string) => {
    updateItems(items.filter(i => i.id !== id))
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (res.ok) { const { url } = await res.json(); setField('src', url) }
  }

  return (
    <div>
      <FolderPicker
        folders={folders}
        activeId={folder?.id ?? ''}
        onSelect={onFolderChange}
        onAdd={onAddFolder}
        onDelete={onDeleteFolder}
      />

      {!folder ? (
        <p style={{ color: '#555', fontSize: 13 }}>Create a folder to get started.</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
            {items.map(item => (
              <div key={item.id} style={{ position: 'relative' }}>
                <div style={{ aspectRatio: '4/3', background: '#1a1a1a', borderRadius: 4, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.src
                    ? <img src={item.src} alt={item.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ color: '#333', fontSize: 11 }}>{item.type}</span>}
                  {item.type === 'video' && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  )}
                </div>
                <p style={{ fontSize: 11, color: '#555', marginTop: 4 }}>{item.type}</p>
                <button onClick={() => remove(item.id)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#ff6b6b', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 14 }}>×</button>
              </div>
            ))}
          </div>

          <div style={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: 6, padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 500, color: '#f0f0f0', marginBottom: 16 }}>Add Item</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <Label>Type</Label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['photo', 'video'] as const).map(t => (
                    <Btn
                      key={t}
                      onClick={() => setField('type', t)}
                      style={{
                        background: form.type === t ? '#3a3a3a' : '#1e1e1e',
                        borderColor: form.type === t ? '#555' : '#2a2a2a',
                        textTransform: 'capitalize',
                      }}
                    >
                      {t}
                    </Btn>
                  ))}
                </div>
              </div>
              <div>
                <Label>Upload file</Label>
                <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleUpload} style={{ display: 'none' }} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Btn onClick={() => fileRef.current?.click()}>Choose File</Btn>
                  {form.src && <span style={{ fontSize: 11, color: '#4ade80' }}>✓</span>}
                </div>
              </div>
              <div>
                <Label>Or URL</Label>
                <Input value={form.src} onChange={e => setField('src', e.target.value)} placeholder="https://…" />
              </div>
              {form.type === 'video' && (
                <div>
                  <Label>YouTube URL</Label>
                  <Input value={form.youtubeUrl} onChange={e => setField('youtubeUrl', e.target.value)} placeholder="https://youtube.com/watch?v=…" />
                </div>
              )}
              <div>
                <Label>Alt / description</Label>
                <Input value={form.alt} onChange={e => setField('alt', e.target.value)} placeholder="Describe the content" />
              </div>
              <Btn variant="primary" onClick={add}>Add Item</Btn>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
