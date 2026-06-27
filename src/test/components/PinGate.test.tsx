import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PinGate from '../../components/PinGate'
import { hashPin } from '../../lib/pin'

const PIN_CORRECTO = '1234'
const HASH_CORRECTO = hashPin(PIN_CORRECTO)

describe('PinGate', () => {
  it('muestra el wordmark Elss', () => {
    render(<PinGate pin={HASH_CORRECTO} onEntrar={() => undefined} />)
    expect(screen.getByText('Elss')).toBeInTheDocument()
  })

  it('tiene un campo de entrada tipo password con aria-label PIN', () => {
    render(<PinGate pin={HASH_CORRECTO} onEntrar={() => undefined} />)
    expect(screen.getByLabelText(/pin/i)).toBeInTheDocument()
  })

  it('llama onEntrar con el PIN correcto', async () => {
    const onEntrar = vi.fn()
    render(<PinGate pin={HASH_CORRECTO} onEntrar={onEntrar} />)
    const input = screen.getByLabelText(/pin/i)
    await userEvent.type(input, PIN_CORRECTO)
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))
    expect(onEntrar).toHaveBeenCalledOnce()
  })

  it('muestra error con PIN incorrecto y NO llama onEntrar', async () => {
    const onEntrar = vi.fn()
    render(<PinGate pin={HASH_CORRECTO} onEntrar={onEntrar} />)
    const input = screen.getByLabelText(/pin/i)
    await userEvent.type(input, '9999')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))
    expect(onEntrar).not.toHaveBeenCalled()
    expect(screen.getByText(/no abre/i)).toBeInTheDocument()
  })

  it('el error se borra al volver a escribir', async () => {
    render(<PinGate pin={HASH_CORRECTO} onEntrar={() => undefined} />)
    const input = screen.getByLabelText(/pin/i)
    await userEvent.type(input, '9999')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))
    expect(screen.getByText(/no abre/i)).toBeInTheDocument()
    await userEvent.type(input, '1')
    expect(screen.queryByText(/no abre/i)).not.toBeInTheDocument()
  })
})
