import type { Pantalla } from '../App'

interface Props {
  activa: Pantalla
  onCambiar: (pantalla: Pantalla) => void
}

const opciones: Array<{ id: Pantalla; label: string }> = [
  { id: 'calendario', label: 'Calendario' },
  { id: 'resumen', label: 'Resumen' },
  { id: 'reporte', label: 'Reporte' },
  { id: 'ajustes', label: 'Ajustes' },
]

function Icono({ pantalla }: { pantalla: Pantalla }) {
  if (pantalla === 'calendario') {
    return (
      <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 10.5 12 4l7 6.5V20H5z" />
        <path d="M9 20v-6h6v6" />
      </svg>
    )
  }

  if (pantalla === 'resumen') {
    return (
      <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 18c2.2-6.5 4.6-8 7-8s4.8 1.5 7 8" />
        <path d="M7 14h10" />
      </svg>
    )
  }

  if (pantalla === 'reporte') {
    return (
      <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 4h7l3 3v13H7z" />
        <path d="M14 4v4h4" />
        <path d="M9.5 12h5M9.5 15h5" />
      </svg>
    )
  }

  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2.2M12 18.3v2.2M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M3.5 12h2.2M18.3 12h2.2M5.6 18.4l1.6-1.6M16.8 7.2l1.6-1.6" />
    </svg>
  )
}

export default function NavInferior({ activa, onCambiar }: Props) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {opciones.map((opcion) => (
        <button
          key={opcion.id}
          className={activa === opcion.id ? 'nav-item active' : 'nav-item'}
          onClick={() => onCambiar(opcion.id)}
          type="button"
        >
          <Icono pantalla={opcion.id} />
          <span>{opcion.label}</span>
        </button>
      ))}
    </nav>
  )
}
