import { useEffect, useMemo, useState } from 'react'
import type {
  AlMoverse,
  CalorEnrojecimiento,
  EstadoGeneral,
  Inflamacion,
  Lado,
  Registro,
  RigidezDuracion,
} from '../types'
import {
  FACTORES,
  LABELS_AL_MOVERSE,
  LABELS_CALOR,
  LABELS_ESTADO,
  LABELS_INFLAMACION,
  LABELS_LADO,
  LABELS_RIGIDEZ,
  ZONAS,
} from '../types'
import { formatearFecha } from '../lib/fechas'

interface Props {
  fecha: string
  registro?: Registro
  onGuardar: (datos: Omit<Registro, 'id' | 'creado_en' | 'actualizado_en'>) => Promise<void>
  onCancelar: () => void
}

function alternar(lista: string[], valor: string): string[] {
  return lista.includes(valor) ? lista.filter((item) => item !== valor) : [...lista, valor]
}

export default function RegistroDiario({ fecha, registro, onGuardar, onCancelar }: Props) {
  const [estado, setEstado] = useState<EstadoGeneral | undefined>(registro?.estado_general)
  const [dolor, setDolor] = useState(registro?.dolor_nivel ?? 3)
  const [zonas, setZonas] = useState<string[]>(registro?.zonas ?? [])
  const [lado, setLado] = useState<Lado | undefined>(registro?.lado)
  const [rigidez, setRigidez] = useState<RigidezDuracion | undefined>(registro?.rigidez_duracion)
  const [inflamacion, setInflamacion] = useState<Inflamacion | undefined>(registro?.inflamacion)
  const [calor, setCalor] = useState<CalorEnrojecimiento | undefined>(registro?.calor_enrojecimiento)
  const [moverse, setMoverse] = useState<AlMoverse | undefined>(registro?.al_moverse)
  const [factores, setFactores] = useState<string[]>(registro?.factores ?? [])
  const [nota, setNota] = useState(registro?.nota ?? '')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    setEstado(registro?.estado_general)
    setDolor(registro?.dolor_nivel ?? 3)
    setZonas(registro?.zonas ?? [])
    setLado(registro?.lado)
    setRigidez(registro?.rigidez_duracion)
    setInflamacion(registro?.inflamacion)
    setCalor(registro?.calor_enrojecimiento)
    setMoverse(registro?.al_moverse)
    setFactores(registro?.factores ?? [])
    setNota(registro?.nota ?? '')
  }, [fecha, registro])

  const mostrarDetalle = useMemo(() => estado !== undefined && estado !== 'bien', [estado])

  async function guardar(estadoElegido = estado) {
    if (!estadoElegido || guardando) return
    setGuardando(true)
    await onGuardar({
      fecha,
      estado_general: estadoElegido,
      dolor_nivel: estadoElegido === 'bien' ? undefined : dolor,
      zonas: estadoElegido === 'bien' || zonas.length === 0 ? undefined : zonas,
      lado: estadoElegido === 'bien' ? undefined : lado,
      rigidez_duracion: estadoElegido === 'bien' ? undefined : rigidez,
      inflamacion: estadoElegido === 'bien' ? undefined : inflamacion,
      calor_enrojecimiento: estadoElegido === 'bien' ? undefined : calor,
      al_moverse: estadoElegido === 'bien' ? undefined : moverse,
      factores: estadoElegido === 'bien' || factores.length === 0 ? undefined : factores,
      nota: estadoElegido === 'bien' || !nota.trim() ? undefined : nota.trim(),
    })
    setGuardando(false)
  }

  async function elegirEstado(nuevoEstado: EstadoGeneral) {
    setEstado(nuevoEstado)
    if (nuevoEstado === 'bien') await guardar(nuevoEstado)
  }

  return (
    <main className="screen form-screen">
      <header className="screen-header">
        <button className="ghost-button" type="button" onClick={onCancelar}>Volver</button>
        <p className="muted">{formatearFecha(fecha)}</p>
      </header>

      <h2>¿Cómo amaneciste hoy?</h2>
      <div className="choice-grid big">
        {(['bien', 'regular', 'molestia', 'mucho_dolor'] as EstadoGeneral[]).map((opcion) => (
          <button
            key={opcion}
            className={estado === opcion ? 'choice selected' : 'choice'}
            type="button"
            onClick={() => void elegirEstado(opcion)}
          >
            {LABELS_ESTADO[opcion]}
          </button>
        ))}
      </div>

      {mostrarDetalle && (
        <section className="form-stack">
          <label className="field-label" htmlFor="dolor">Malestar {dolor} de 10</label>
          <input id="dolor" type="range" min="0" max="10" step="1" value={dolor} onChange={(event) => setDolor(Number(event.target.value))} />

          <fieldset>
            <legend>Zonas</legend>
            <div className="chip-grid">
              {ZONAS.map((zona) => (
                <button key={zona} type="button" className={zonas.includes(zona) ? 'chip selected' : 'chip'} onClick={() => setZonas(alternar(zonas, zona))}>
                  {zona}
                </button>
              ))}
            </div>
          </fieldset>

          <RadioGrupo titulo="Lado" valor={lado} opciones={LABELS_LADO} onChange={setLado} />
          <RadioGrupo titulo="Rigidez" valor={rigidez} opciones={LABELS_RIGIDEZ} onChange={setRigidez} />
          <RadioGrupo titulo="Inflamación" valor={inflamacion} opciones={LABELS_INFLAMACION} onChange={setInflamacion} />
          <RadioGrupo titulo="Calor o enrojecimiento" valor={calor} opciones={LABELS_CALOR} onChange={setCalor} />
          <RadioGrupo titulo="Al moverse" valor={moverse} opciones={LABELS_AL_MOVERSE} onChange={setMoverse} />

          <fieldset>
            <legend>¿Qué pudo influir ayer?</legend>
            <div className="chip-grid">
              {FACTORES.map((factor) => (
                <button key={factor} type="button" className={factores.includes(factor) ? 'chip selected' : 'chip'} onClick={() => setFactores(alternar(factores, factor))}>
                  {factor}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="field-label" htmlFor="nota">Nota</label>
          <textarea id="nota" value={nota} onChange={(event) => setNota(event.target.value)} rows={3} placeholder="Algo que quieras recordar" />
          <button className="primary-button" type="button" disabled={!estado || guardando} onClick={() => void guardar()}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </section>
      )}
    </main>
  )
}

interface RadioGrupoProps<T extends string> {
  titulo: string
  valor?: T
  opciones: Record<T, string>
  onChange: (valor: T) => void
}

function RadioGrupo<T extends string>({ titulo, valor, opciones, onChange }: RadioGrupoProps<T>) {
  return (
    <fieldset>
      <legend>{titulo}</legend>
      <div className="chip-grid">
        {(Object.entries(opciones) as Array<[T, string]>).map(([key, label]) => (
          <button key={key} type="button" className={valor === key ? 'chip selected' : 'chip'} onClick={() => onChange(key)}>
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
