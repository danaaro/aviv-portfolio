interface Film {
  id: string
  title: string
  duration: string
  year?: number
  posterSrc: string
  youtubeUrl: string
  description?: string
}

interface CinemaCardProps {
  film: Film
}

export default function CinemaCard({ film }: CinemaCardProps) {
  const handleClick = () => {
    if (film.youtubeUrl) {
      window.open(film.youtubeUrl, '_blank', 'noopener')
    }
  }

  return (
    <div
      onClick={film.youtubeUrl ? handleClick : undefined}
      style={{
        cursor: film.youtubeUrl ? 'pointer' : 'default',
        background: 'var(--surface)',
      }}
      className="group"
    >
      {/* Poster */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '2/3',
          overflow: 'hidden',
          background: '#111',
        }}
      >
        {film.posterSrc ? (
          <img
            src={film.posterSrc}
            alt={film.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 0.4s ease, filter 0.3s ease',
            }}
            className="group-hover:scale-[1.03] group-hover:brightness-75"
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#333',
              fontSize: 12,
              letterSpacing: '0.1em',
            }}
          >
            POSTER
          </div>
        )}

        {/* Play overlay */}
        {film.youtubeUrl && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.25s',
            }}
            className="group-hover:opacity-100"
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 4px 20px' }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text)',
            marginBottom: 4,
            lineHeight: 1.3,
          }}
        >
          {film.title}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          {[film.year, film.duration].filter(Boolean).join(' · ')}
        </p>
      </div>
    </div>
  )
}
