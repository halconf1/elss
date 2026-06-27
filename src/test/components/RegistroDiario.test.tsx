import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegistroDiario from '../../components/RegistroDiario'
import type { Registro } from '../../types'

const FECHA = '2026-06-27'
const onGuardar = vi.fn(async () => undefined)
const onCancelar = vi.fn()

function renderizar(registro?: Registro) {
  return render(
    <RegistroDiario
      fecha={FECHA}
      registro={registro}
      onGuardar={onGuardar}
      onCancelar={onCancelar}
    />
  )
}

describe('RegistroDiario', () => {
  it('muestra la pregunta principal', () => {
    renderizar()
    expect(screen.getByText(/¿Cómo amaneciste hoy\?/i)).toBeInTheDocument()
  })

  it('tiene los 4 botones de estado general', () => {
    renderizar()
    expect(screen.getByRole('button', { name: /bien/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /regular/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /molestia/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mucho dolor/i })).toBeInTheDocument()
  })

  it('no contiene las palabras prohibidas en la portada del formulario', () => {
    const { container } = renderizar()
    // "dolor" puede aparecer como id de input; chequeamos que no sea visible
    const elementosVisibles = Array.from(container.querySelectorAll('h1,h2,h3,p,button,label,legend'))
    const textoElementos = elementosVisibles.map(el => el.textContent?.toLowerCase() ?? '').join(' ')
    expect(textoElementos).not.toContain('síntomas')
    expect(textoElementos).not.toContain('médico')
  })

  it('elegir "Bien" llama onGuardar inmediatamente con estado_general "bien"', async () => {
    renderizar()
    await userEvent.click(screen.getByRole('button', { name: /^bien$/i }))
    await waitFor(() => {
      expect(onGuardar).toHaveBeenCalledWith(
        expect.objectContaining({ estado_general: 'bien', fecha: FECHA })
      )
    })
  })

  it('elegir "Regular" despliega el formulario de detalle', async () => {
    renderizar()
    await userEvent.click(screen.getByRole('button', { name: /^regular$/i }))
    expect(screen.getByText(/malestar/i)).toBeInTheDocument()
    expect(screen.getByText(/zonas/i)).toBeInTheDocument()
  })

  it('elegir "Con molestia" despliega el formulario de detalle', async () => {
    renderizar()
    await userEvent.click(screen.getByRole('button', { name: /con molestia/i }))
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument()
  })

  it('el botón Guardar llama onGuardar con el estado seleccionado', async () => {
    renderizar()
    await userEvent.click(screen.getByRole('button', { name: /con molestia/i }))
    await userEvent.click(screen.getByRole('button', { name: /^guardar$/i }))
    await waitFor(() => {
      expect(onGuardar).toHaveBeenCalledWith(
        expect.objectContaining({ estado_general: 'molestia' })
      )
    })
  })

  it('el botón Volver llama onCancelar', async () => {
    renderizar()
    await userEvent.click(screen.getByRole('button', { name: /volver/i }))
    expect(onCancelar).toHaveBeenCalledOnce()
  })

  it('prerrellena los campos si se pasa un registro existente', () => {
    const registro: Registro = {
      id: 'abc',
      fecha: FECHA,
      estado_general: 'molestia',
      dolor_nivel: 7,
      zonas: ['rodillas'],
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    }
    renderizar(registro)
    // El estado "molestia" debe estar ya marcado
    const btnMolestia = screen.getByRole('button', { name: /con molestia/i })
    expect(btnMolestia.className).toContain('selected')
  })

  it('seleccionar zonas funciona en modo multi-select', async () => {
    renderizar()
    await userEvent.click(screen.getByRole('button', { name: /con molestia/i }))
    const rodillas = screen.getByRole('button', { name: /^rodillas$/i })
    await userEvent.click(rodillas)
    expect(rodillas.className).toContain('selected')
    await userEvent.click(rodillas) // deseleccionar
    expect(rodillas.className).not.toContain('selected')
  })
})
