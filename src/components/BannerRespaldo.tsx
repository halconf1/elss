interface Props {
  titulo?: string
  texto?: string
  onAceptar: () => void
  onPosponer: () => void
}

export default function BannerRespaldo({
  titulo = 'Tu primer registro quedó guardado.',
  texto = '¿Quieres compartir un respaldo para no perderlo si cambias de teléfono?',
  onAceptar,
  onPosponer,
}: Props) {
  return (
    <div style={s.fondo}>
      <div style={s.tarjeta}>
        <svg style={s.icono} width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
          <circle cx="17" cy="17" r="7" fill="none" stroke="var(--accent)" strokeWidth="1.7" />
          <path d="M17 3v5M17 26v5M3 17h5M26 17h5M7.1 7.1l3.5 3.5M23.4 23.4l3.5 3.5M26.9 7.1l-3.5 3.5M10.6 23.4l-3.5 3.5" fill="none" stroke="var(--muted)" strokeLinecap="round" strokeWidth="1.7" />
        </svg>
        <p style={s.titulo}>{titulo}</p>
        <p style={s.texto}>{texto}</p>
        <div style={s.botones}>
          <button onClick={onAceptar} style={s.btnPrincipal}>
            Sí, guardar respaldo
          </button>
          <button onClick={onPosponer} style={s.btnSecundario}>
            Ahora no
          </button>
        </div>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  fondo: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(74, 67, 104, 0.35)',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '1rem',
    zIndex: 50,
  },
  tarjeta: {
    background: 'var(--bg)',
    borderRadius: 'var(--radius)',
    padding: '1.75rem 1.5rem',
    width: '100%',
    maxWidth: 480,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  icono: {
    display: 'block',
  },
  titulo: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.1rem',
    color: 'var(--accent)',
    fontWeight: 500,
  },
  texto: {
    color: 'var(--muted)',
    fontSize: '0.9rem',
    lineHeight: 1.5,
  },
  botones: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  btnPrincipal: {
    padding: '0.9rem',
    background: 'var(--btn-bg)',
    color: 'var(--btn-text)',
    borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
  },
  btnSecundario: {
    padding: '0.9rem',
    background: 'none',
    color: 'var(--muted)',
    borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    border: 'none',
  },
}
