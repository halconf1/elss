import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Calendario from '../../components/Calendario'
import type { Registro } from '../../types'

const MES_JUNIO = new Date(2026, 5, 1)
const onCambiarMes = vi.fn()
const onSeleccionarFecha = vi.fn()

function renderCalendario(registros: Registro[] = []) {
  return render(
    <Calendario
      mes={MES_JUNIO}
      registros={registros}
      onCambiarMes={onCambiarMes}
      onSeleccionarFecha={onSeleccionarFecha}
    />
  )
}

describe('Calendario', () => {
  it('muestra el wordmark Elss', () => {
    renderCalendario()
    expect(screen.getByText('Elss')).toBeInTheDocument()
  })

  it('muestra el subtítulo correcto', () => {
    renderCalendario()
    expect(screen.getByText(/vamos anotando tus días/i)).toBeInTheDocument()
  })

  it('muestra el nombre del mes actual', () => {
    renderCalendario()
    expect(screen.getByText(/junio/i)).toBeInTheDocument()
  })

  it('muestra las etiquetas de días de la semana', () => {
    renderCalendario()
    const labels = ['L', 'M', 'J', 'V', 'S', 'D']
    for (const label of labels) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0)
    }
  })

  it('muestra el botón de registrar mañana', () => {
    renderCalendario()
    expect(screen.getByRole('button', { name: /registrar mi mañana/i })).toBeInTheDocument()
  })

  it('tiene controles de navegación de mes', () => {
    renderCalendario()
    expect(screen.getByRole('button', { name: /mes anterior/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mes siguiente/i })).toBeInTheDocument()
  })

  it('llama onCambiarMes con el mes correcto al avanzar', async () => {
    renderCalendario()
    await userEvent.click(screen.getByRole('button', { name: /mes siguiente/i }))
    expect(onCambiarMes).toHaveBeenCalledWith(new Date(2026, 6, 1))
  })

  it('llama onCambiarMes con el mes correcto al retroceder', async () => {
    renderCalendario()
    await userEvent.click(screen.getByRole('button', { name: /mes anterior/i }))
    expect(onCambiarMes).toHaveBeenCalledWith(new Date(2026, 4, 1))
  })

  it('al pulsar "Registrar mi mañana" llama onSeleccionarFecha con hoy', async () => {
    renderCalendario()
    await userEvent.click(screen.getByRole('button', { name: /registrar mi mañana/i }))
    expect(onSeleccionarFecha).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/))
  })

  it('renderiza las caritas para los registros existentes', () => {
    const registros: Registro[] = [
      {
        id: '1',
        fecha: '2026-06-15',
        estado_general: 'bien',
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString(),
      },
    ]
    const { container } = renderCalendario(registros)
    // Carita renderiza un SVG
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })
})
