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
          {opcion.label}
        </button>
      ))}
    </nav>
  )
}
