interface Props {
  onAceptar: () => void
  onPosponer: () => void
}

export default function BannerRespaldo({ onAceptar, onPosponer }: Props) {
  return (
    <div style={s.fondo}>
      <div style={s.tarjeta}>
        <p style={s.emoji} aria-hidden>☀️</p>
        <p style={s.titulo}>Tu primer registro quedó guardado.</p>
        <p style={s.texto}>
          ¿Quieres compartir un respaldo para no perderlo si cambias de teléfono?
        </p>
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
  emoji: {
    fontSize: '2rem',
    lineHeight: 1,
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
