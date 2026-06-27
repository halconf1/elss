import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Onboarding from '../../components/Onboarding'

describe('Onboarding', () => {
  it('muestra el wordmark Elss', () => {
    render(<Onboarding onTerminar={() => undefined} />)
    expect(screen.getByText('Elss')).toBeInTheDocument()
  })

  it('muestra la copy exacta del brief', () => {
    render(<Onboarding onTerminar={() => undefined} />)
    expect(screen.getByText('Registremos cómo amaneces.')).toBeInTheDocument()
    expect(screen.getByText('Vamos anotando tus días.')).toBeInTheDocument()
  })

  it('no contiene las palabras prohibidas (dolor / síntomas / médico)', () => {
    const { container } = render(<Onboarding onTerminar={() => undefined} />)
    const texto = container.textContent?.toLowerCase() ?? ''
    expect(texto).not.toContain('dolor')
    expect(texto).not.toContain('síntomas')
    expect(texto).not.toContain('médico')
  })

  it('tiene el botón Empezar', () => {
    render(<Onboarding onTerminar={() => undefined} />)
    expect(screen.getByRole('button', { name: /empezar/i })).toBeInTheDocument()
  })

  it('llama onTerminar al pulsar Empezar', async () => {
    const onTerminar = vi.fn()
    render(<Onboarding onTerminar={onTerminar} />)
    await userEvent.click(screen.getByRole('button', { name: /empezar/i }))
    expect(onTerminar).toHaveBeenCalledOnce()
  })
})
