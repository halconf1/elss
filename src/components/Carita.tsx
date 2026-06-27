import type { EstadoGeneral } from '../types'
import { ESTADO_COLORES } from '../types'

interface Props {
  estado: EstadoGeneral
  size?: number
}

export default function Carita({ estado, size = 22 }: Props) {
  const color = ESTADO_COLORES[estado].trazo
  const comun = {
    stroke: color,
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    fill: 'none',
  }

  return (
    <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden="true" focusable="false">
      <circle cx="11" cy="11" r="9" {...comun} strokeWidth={1.2} />
      {estado === 'mucho_dolor' ? (
        <>
          <path d="M6 8.5 Q7.5 7.3 9 8.5" {...comun} />
          <path d="M13 8.5 Q14.5 7.3 16 8.5" {...comun} />
          <path d="M6.5 15 Q11 10.5 15.5 15" {...comun} />
        </>
      ) : (
        <>
          <circle cx="7.5" cy="8.5" r="1.15" fill={color} />
          <circle cx="14.5" cy="8.5" r="1.15" fill={color} />
          {estado === 'bien' && <path d="M6 12.5 Q11 16.5 16 12.5" {...comun} />}
          {estado === 'regular' && <line x1="6.5" y1="13.5" x2="15.5" y2="13.5" {...comun} />}
          {estado === 'molestia' && <path d="M6 14.5 Q11 11 16 14.5" {...comun} />}
        </>
      )}
    </svg>
  )
}
