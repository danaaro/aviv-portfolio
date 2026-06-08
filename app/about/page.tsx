export default function AboutPage() {
  return (
    <div
      style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: '64px 32px 80px',
      }}
    >
      {/* Name */}
      <h1
        style={{
          fontSize: 36,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: '#111',
          marginBottom: 40,
        }}
      >
        Aviv Shmuelov
      </h1>

      {/* Bio */}
      <div
        style={{
          lineHeight: 1.8,
          fontSize: 16,
          color: '#2a2a2a',
        }}
      >
        <p style={{ marginBottom: 24 }}>
          Aviv Shmuelov is a filmmaker, photographer, and visual artist based in Modi&apos;in, Israel.
        </p>
        <p style={{ marginBottom: 24 }}>
          Trained in Film &amp; Television Engineering at ORT Psgot College, Aviv spent three years
          as an operational combat photographer in the Israeli Navy — documenting naval activities
          in real-time, accompanying sensitive IDF diplomatic missions abroad, and covering
          internationally resonant events including protest flotillas and activists such as Greta
          Thunberg.
        </p>
        <p style={{ marginBottom: 24 }}>
          Before and beyond his military service, he built his creative life deliberately: archiving
          rare films at the Jerusalem Cinematheque, working the Jerusalem Film Festival for four
          seasons, founding an independent fashion brand (Crispy), and producing original video
          content under his own production banner, Peak Productions.
        </p>
        <p>
          His work lives at the intersection of documentary instinct, cinematic vision, and fashion
          sensibility — shaped by years of shooting under pressure, in the field, with no margin for
          error.
        </p>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: 'var(--border)',
          margin: '48px 0',
        }}
      />

      {/* Contact */}
      <div>
        <h2
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: 24,
          }}
        >
          Contact
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ContactLink
            icon={<EmailIcon />}
            label="aviv1404@gmail.com"
            href="mailto:aviv1404@gmail.com"
          />
          <ContactLink
            icon={<WhatsAppIcon />}
            label="+972 52-630-5303"
            href="https://wa.me/972526305303"
          />
          <ContactLink
            icon={<InstagramIcon />}
            label="Instagram"
            href="#"
            placeholder
          />
        </div>
      </div>
    </div>
  )
}

function ContactLink({
  icon,
  label,
  href,
  placeholder,
}: {
  icon: React.ReactNode
  label: string
  href: string
  placeholder?: boolean
}) {
  return (
    <a
      href={href}
      target={href.startsWith('mailto') ? undefined : '_blank'}
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        color: placeholder ? '#aaa' : '#222',
        textDecoration: 'none',
        fontSize: 14,
        transition: 'color 0.15s',
        cursor: placeholder ? 'not-allowed' : 'pointer',
      }}
    >
      <span style={{ opacity: placeholder ? 0.4 : 0.7 }}>{icon}</span>
      <span>
        {label}
        {placeholder && (
          <span style={{ marginLeft: 8, fontSize: 11, letterSpacing: '0.08em', color: '#999' }}>
            COMING SOON
          </span>
        )}
      </span>
    </a>
  )
}

function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 7 10-7" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  )
}
