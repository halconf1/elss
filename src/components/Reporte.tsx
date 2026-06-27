import { useMemo, useState } from 'react'
import type { Registro } from '../types'
import { calcularReporte } from '../lib/stats'
import { descargarReportePdf } from '../lib/pdf'
import { formatearFecha, rangoMes, rangoSemana } from '../lib/fechas'

interface Props {
  registros: Registro[]
}

type Periodo = 'semana' | 'mes' | 'todo'

function filtrar(registros: Registro[], periodo: Periodo): { registros: Registro[]; desde?: string; hasta?: string } {
  if (periodo === 'todo') return { registros }
  const rango = periodo === 'semana' ? rangoSemana() : rangoMes()
  return {
    ...rango,
    registros: registros.filter((registro) => registro.fecha >= rango.desde && registro.fecha <= rango.hasta),
  }
}

function lista(conteos: Array<{ nombre: string; total: number }>): string {
  return conteos.slice(0, 5).map((item) => `${item.nombre} (${item.total})`).join(', ') || 'Sin dato'
}

export default function Reporte({ registros }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const filtrado = useMemo(() => filtrar(registros, periodo), [registros, periodo])
  const datos = useMemo(() => calcularReporte(filtrado.registros), [filtrado.registros])

  return (
    <main className="screen content-screen">
      <h2>Reporte</h2>
      <div className="segmented" role="group" aria-label="Periodo">
        {(['semana', 'mes', 'todo'] as Periodo[]).map((opcion) => (
          <button key={opcion} type="button" className={periodo === opcion ? 'selected' : ''} onClick={() => setPeriodo(opcion)}>
            {opcion === 'todo' ? 'Todo' : opcion}
          </button>
        ))}
      </div>

      <section className="data-list">
        {filtrado.desde && filtrado.hasta && <p><span>Periodo</span><strong>{formatearFecha(filtrado.desde)} - {formatearFecha(filtrado.hasta)}</strong></p>}
        <p><span>Días con dato</span><strong>{datos.total}</strong></p>
        <p><span>Días bien</span><strong>{datos.bien} de {datos.total}</strong></p>
        <p><span>Días con molestia</span><strong>{datos.conMolestia} de {datos.total}</strong></p>
        <p><span>Dolor promedio</span><strong>{datos.dolorPromedio ?? 'Sin dato'}</strong></p>
        <p><span>Dolor máximo</span><strong>{datos.dolorMaximo ?? 'Sin dato'}</strong></p>
        <p><span>Zonas más frecuentes</span><strong>{lista(datos.zonasFrecuentes)}</strong></p>
        <p><span>Rigidez mayor a 30 min</span><strong>{datos.rigidezMas30}</strong></p>
        <p><span>Rigidez mayor a 1 hora</span><strong>{datos.rigidezMas60}</strong></p>
        <p><span>Inflamación visible</span><strong>{datos.inflamacionVisible}</strong></p>
        <p><span>Calor o enrojecimiento</span><strong>{datos.calorEnrojecimiento}</strong></p>
        <p><span>Mejora con movimiento</span><strong>{datos.mejoraMovimiento}</strong></p>
        <p><span>Empeora con esfuerzo</span><strong>{datos.empeoraMovimiento}</strong></p>
        <p><span>Factores recurrentes</span><strong>{lista(datos.factoresFrecuentes)}</strong></p>
      </section>

      <section className="soft-panel notes-panel">
        <h3>Notas de días con molestia</h3>
        {datos.notasMolestia.length === 0 ? (
          <p className="muted">Sin notas registradas.</p>
        ) : datos.notasMolestia.map((nota) => (
          <p key={`${nota.fecha}-${nota.nota}`}><strong>{formatearFecha(nota.fecha)}</strong> {nota.nota}</p>
        ))}
      </section>

      <button className="primary-button" type="button" onClick={() => void descargarReportePdf(datos, periodo, filtrado.desde, filtrado.hasta)}>
        Descargar PDF
      </button>
    </main>
  )
}
