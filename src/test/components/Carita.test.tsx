import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Carita from '../../components/Carita'
import { ESTADO_COLORES } from '../../types'
import type { EstadoGeneral } from '../../types'

const ESTADOS: EstadoGeneral[] = ['bien', 'regular', 'molestia', 'mucho_dolor']

describe('Carita', () => {
  it.each(ESTADOS)('renderiza un SVG para el estado "%s"', (estado) => {
    const { container } = render(<Carita estado={estado} />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
  })

  it('usa el tamaño por defecto 22×22', () => {
    const { container } = render(<Carita estado="bien" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('22')
    expect(svg?.getAttribute('height')).toBe('22')
  })

  it('acepta tamaño personalizado', () => {
    const { container } = render(<Carita estado="bien" size={40} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('40')
    expect(svg?.getAttribute('height')).toBe('40')
  })

  it.each(ESTADOS)('usa el color de trazo correcto para "%s"', (estado) => {
    const { container } = render(<Carita estado={estado} />)
    const svg = container.querySelector('svg')
    const colorEsperado = ESTADO_COLORES[estado].trazo
    // El color aparece en stroke o fill de algún elemento
    expect(svg?.innerHTML).toContain(colorEsperado)
  })

  it('"bien" tiene una sonrisa (boca hacia arriba)', () => {
    const { container } = render(<Carita estado="bien" />)
    const path = container.querySelector('path[d^="M6 12.5"]')
    expect(path).not.toBeNull()
  })

  it('"regular" tiene una línea recta como boca', () => {
    const { container } = render(<Carita estado="regular" />)
    const linea = container.querySelector('line')
    expect(linea).not.toBeNull()
  })

  it('"mucho_dolor" usa arcos como cejas en lugar de círculos como ojos', () => {
    const { container } = render(<Carita estado="mucho_dolor" />)
    // mucho_dolor no tiene <circle> para los ojos
    const circles = container.querySelectorAll('circle[r="1.15"]')
    expect(circles).toHaveLength(0)
  })

  it('tiene aria-hidden para no interferir con lectores de pantalla', () => {
    const { container } = render(<Carita estado="bien" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
  })
})
