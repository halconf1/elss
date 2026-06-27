import { useState } from 'react'
import { hashPin } from '../lib/pin'

interface Props {
  pin: string
  onEntrar: () => void
}

export default function PinGate({ pin, onEntrar }: Props) {
  const [valor, setValor] = useState('')
  const [error, setError] = useState('')

  function probar() {
    if (hashPin(valor) === pin) {
      onEntrar()
      return
    }
    setError('Ese PIN no abre esta libreta.')
  }

  return (
    <main className="screen pin-screen">
      <h1>Elss</h1>
      <p className="muted">Tu libreta está tapada con PIN.</p>
      <input
        value={valor}
        onChange={(event) => {
          setValor(event.target.value)
          setError('')
        }}
        inputMode="numeric"
        type="password"
        maxLength={8}
        aria-label="PIN"
      />
      {error && <p className="error-text">{error}</p>}
      <button className="primary-button" type="button" onClick={probar}>Entrar</button>
    </main>
  )
}
