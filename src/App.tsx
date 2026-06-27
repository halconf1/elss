import { useEffect, useMemo, useState } from 'react'
import type { Config, Registro } from './types'
import { borrarTodo, listarRegistros, obtenerPorFecha, upsertPorFecha } from './db/registros'
import { guardarConfig, leerConfig } from './db/config'
import { solicitarPersistencia } from './db/database'
import { compartirODescargarRespaldo } from './lib/backup'
import { claveFecha, diasDesde } from './lib/fechas'
import Ajustes from './components/Ajustes'
import BannerRespaldo from './components/BannerRespaldo'
import Calendario from './components/Calendario'
import NavInferior from './components/NavInferior'
import Onboarding from './components/Onboarding'
import PinGate from './components/PinGate'
import RegistroDiario from './components/RegistroDiario'
import Reporte from './components/Reporte'
import ResumenSemanal from './components/ResumenSemanal'

export type Pantalla = 'calendario' | 'resumen' | 'reporte' | 'ajustes'

type Vista = Pantalla | 'registro'

interface BackupPrompt {
  tipo: 'primero' | 'semanal'
}

function ultimosSieteDias(registros: Registro[]): Registro[] {
  const hasta = new Date()
  const desde = new Date()
  desde.setDate(hasta.getDate() - 6)
  const desdeClave = claveFecha(desde)
  const hastaClave = claveFecha(hasta)
  return registros.filter((registro) => registro.fecha >= desdeClave && registro.fecha <= hastaClave)
}

export default function App() {
  const [cargando, setCargando] = useState(true)
  const [config, setConfig] = useState<Config | null>(null)
  const [registros, setRegistros] = useState<Registro[]>([])
  const [vista, setVista] = useState<Vista>('calendario')
  const [pantallaActiva, setPantallaActiva] = useState<Pantalla>('calendario')
  const [pinValidado, setPinValidado] = useState(false)
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(claveFecha(new Date()))
  const [registroSeleccionado, setRegistroSeleccionado] = useState<Registro | undefined>()
  const [mes, setMes] = useState(new Date())
  const [backupPrompt, setBackupPrompt] = useState<BackupPrompt | null>(null)

  async function recargarRegistros() {
    setRegistros(await listarRegistros())
  }

  async function actualizarConfig(parcial: Partial<Omit<Config, 'id'>>) {
    const nueva = await guardarConfig(parcial)
    setConfig(nueva)
  }

  useEffect(() => {
    async function iniciar() {
      const cfgBase = await leerConfig()
      const persistido = await solicitarPersistencia()
      const cfg = await guardarConfig({ storage_persistido: persistido })
      const lista = await listarRegistros()
      setConfig({ ...cfgBase, ...cfg })
      setRegistros(lista)
      if (cfg.ultimo_respaldo && diasDesde(cfg.ultimo_respaldo) >= 7) {
        setBackupPrompt({ tipo: 'semanal' })
      }
      setCargando(false)
    }

    void iniciar()
  }, [])

  const requierePin = Boolean(config?.pin && !pinValidado)
  const semanales = useMemo(() => ultimosSieteDias(registros), [registros])

  async function abrirRegistro(fecha: string) {
    setFechaSeleccionada(fecha)
    setRegistroSeleccionado(await obtenerPorFecha(fecha))
    setVista('registro')
  }

  async function guardarRegistro(datos: Omit<Registro, 'id' | 'creado_en' | 'actualizado_en'>) {
    const eraPrimerRegistro = registros.length === 0
    await upsertPorFecha(datos)
    await recargarRegistros()
    setVista(pantallaActiva)

    if (eraPrimerRegistro && config && !config.primer_respaldo_ofrecido) {
      setBackupPrompt({ tipo: 'primero' })
    }
  }

  function cambiarPantalla(pantalla: Pantalla) {
    setPantallaActiva(pantalla)
    setVista(pantalla)
  }

  async function aceptarRespaldo() {
    await compartirODescargarRespaldo()
    await actualizarConfig({ primer_respaldo_ofrecido: true, ultimo_respaldo: new Date().toISOString() })
    setBackupPrompt(null)
  }

  async function posponerRespaldo() {
    await actualizarConfig({ primer_respaldo_ofrecido: true })
    setBackupPrompt(null)
  }

  async function borrarRegistros() {
    await borrarTodo()
    await recargarRegistros()
  }

  if (cargando || !config) {
    return (
      <main className="screen loading-screen">
        <h1>Elss</h1>
      </main>
    )
  }

  if (!config.onboarding_visto) {
    return <Onboarding onTerminar={() => void actualizarConfig({ onboarding_visto: true })} />
  }

  if (requierePin && config.pin) {
    return <PinGate pin={config.pin} onEntrar={() => setPinValidado(true)} />
  }

  return (
    <>
      {vista === 'calendario' && (
        <Calendario
          mes={mes}
          registros={registros}
          onCambiarMes={setMes}
          onSeleccionarFecha={(fecha) => void abrirRegistro(fecha)}
        />
      )}
      {vista === 'registro' && (
        <RegistroDiario
          fecha={fechaSeleccionada}
          registro={registroSeleccionado}
          onGuardar={guardarRegistro}
          onCancelar={() => setVista(pantallaActiva)}
        />
      )}
      {vista === 'resumen' && <ResumenSemanal registros={semanales} />}
      {vista === 'reporte' && <Reporte registros={registros} />}
      {vista === 'ajustes' && (
        <Ajustes
          config={config}
          onConfigChange={actualizarConfig}
          onDatosChange={recargarRegistros}
          onBorrarTodo={borrarRegistros}
        />
      )}

      {vista !== 'registro' && <NavInferior activa={pantallaActiva} onCambiar={cambiarPantalla} />}

      {backupPrompt && (
        <BannerRespaldo
          titulo={backupPrompt.tipo === 'primero' ? 'Tu primer registro quedó guardado.' : 'Ya toca hacer un respaldo.'}
          texto={backupPrompt.tipo === 'primero'
            ? '¿Quieres compartir un respaldo para no perderlo si cambias de teléfono?'
            : 'Han pasado varios días desde el último respaldo.'}
          onAceptar={() => void aceptarRespaldo()}
          onPosponer={() => void posponerRespaldo()}
        />
      )}
    </>
  )
}
