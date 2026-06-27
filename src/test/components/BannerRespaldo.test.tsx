import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BannerRespaldo from '../../components/BannerRespaldo'

describe('BannerRespaldo', () => {
  it('muestra el título por defecto', () => {
    render(<BannerRespaldo onAceptar={() => undefined} onPosponer={() => undefined} />)
    expect(screen.getByText(/primer registro quedó guardado/i)).toBeInTheDocument()
  })

  it('muestra un título personalizado', () => {
    render(<BannerRespaldo titulo="Título de prueba" onAceptar={() => undefined} onPosponer={() => undefined} />)
    expect(screen.getByText('Título de prueba')).toBeInTheDocument()
  })

  it('tiene los dos botones de acción', () => {
    render(<BannerRespaldo onAceptar={() => undefined} onPosponer={() => undefined} />)
    expect(screen.getByRole('button', { name: /sí, guardar respaldo/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ahora no/i })).toBeInTheDocument()
  })

  it('llama onAceptar al pulsar el botón principal', async () => {
    const onAceptar = vi.fn()
    render(<BannerRespaldo onAceptar={onAceptar} onPosponer={() => undefined} />)
    await userEvent.click(screen.getByRole('button', { name: /sí, guardar respaldo/i }))
    expect(onAceptar).toHaveBeenCalledOnce()
  })

  it('llama onPosponer al pulsar Ahora no', async () => {
    const onPosponer = vi.fn()
    render(<BannerRespaldo onAceptar={() => undefined} onPosponer={onPosponer} />)
    await userEvent.click(screen.getByRole('button', { name: /ahora no/i }))
    expect(onPosponer).toHaveBeenCalledOnce()
  })
})
