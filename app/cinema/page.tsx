import CinemaCard from '@/components/CinemaCard'
import cinemaData from '@/data/cinema.json'

export default function CinemaPage() {
  const { films } = cinemaData

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      {films.length === 0 ? (
        <div
          style={{
            padding: '80px 20px',
            textAlign: 'center',
            color: '#888',
            fontSize: 14,
            letterSpacing: '0.08em',
          }}
        >
          Content coming soon
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '32px 24px',
          }}
        >
          {films.map(film => (
            <CinemaCard key={film.id} film={film} />
          ))}
        </div>
      )}
    </div>
  )
}
