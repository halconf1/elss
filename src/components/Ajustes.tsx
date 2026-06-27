import { useRef, useState } from 'react'
import type { Config } from '../types'
import { compartirODescargarRespaldo, importarRespaldo } from '../lib/backup'
import { diasDesde, formatearFecha, formatearHora } from '../lib/fechas'
import { hashPin } from '../lib/pin'

interface Props {
  config: Config
  onConfigChange: (parcial: Partial<Omit<Config, 'id'>>) => Promise<void>
  onDatosChange: () => Promise<void>
  onBorrarTodo: () => Promise<void>
}

export default function Ajustes({ config, onConfigChange, onDatosChange, onBorrarTodo }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [pin, setPin] = useState('')

  async function respaldar() {
    const resultado = await compartirODescargarRespaldo()
    await onConfigChange({ ultimo_respaldo: new Date().toISOString() })
    setMensaje(resultado === 'compartido' ? 'Respaldo compartido.' : 'Respaldo descargado.')
  }

  async function importar(file: File | undefined) {
    if (!file) return
    try {
      const total = await importarRespaldo(file)
      await onDatosChange()
      setMensaje(`Se importaron ${total} registros.`)
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : 'No se pudo importar el respaldo.')
    }
  }

  async function borrar() {
    if (!confirm('¿Borrar todos los registros de esta libreta?')) return
    await onBorrarTodo()
    setMensaje('Se borraron los registros.')
  }

  async function guardarPin() {
    await onConfigChange({ pin: pin ? hashPin(pin) : undefined })
    setPin('')
    setMensaje(pin ? 'PIN actualizado.' : 'PIN quitado.')
  }

  const ultimo = config.ultimo_respaldo
  const dias = ultimo ? diasDesde(ultimo) : null

  return (
    <main className="screen content-screen">
      <h2>Ajustes</h2>

      <section className="soft-panel">
        <h3>Estado de respaldo</h3>
        <p>
          {ultimo
            ? `Último respaldo: ${formatearFecha(ultimo)}, ${formatearHora(ultimo)}`
            : 'Aún no hay respaldo guardado.'}
        </p>
        {dias !== null && dias >= 7 && <p>Han pasado {dias} días desde tu último respaldo.</p>}
        <button className="primary-button" type="button" onClick={() => void respaldar()}>Compartir respaldo</button>
      </section>

      <section className="soft-panel">
        <h3>Importar respaldo</h3>
        <input ref={inputRef} type="file" accept="application/json,.json" onChange={(event) => void importar(event.target.files?.[0])} />
      </section>

      <section className="soft-panel">
        <h3>PIN</h3>
        <p className="muted">El PIN solo tapa la pantalla de esta libreta.</p>
        <input value={pin} onChange={(event) => setPin(event.target.value)} inputMode="numeric" type="password" placeholder="Nuevo PIN o vacío para quitarlo" />
        <button className="secondary-button" type="button" onClick={() => void guardarPin()}>Poner / cambiar PIN</button>
      </section>

      <section className="soft-panel danger-zone">
        <h3>Borrar todo</h3>
        <button className="danger-button" type="button" onClick={() => void borrar()}>Borrar todo</button>
      </section>

      {mensaje && <p className="status-text">{mensaje}</p>}
    </main>
  )
}
