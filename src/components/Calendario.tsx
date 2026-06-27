import type { Registro } from '../types'
import { ESTADO_COLORES } from '../types'
import { claveFecha, hoy, nombreMesTitulo } from '../lib/fechas'
import Carita from './Carita'

interface Props {
  mes: Date
  registros: Registro[]
  onCambiarMes: (mes: Date) => void
  onSeleccionarFecha: (fecha: string) => void
}

const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function diasDelCalendario(mes: Date): Array<{ fecha: string; dia: number; enMes: boolean }> {
  const y = mes.getFullYear()
  const m = mes.getMonth()
  const primero = new Date(y, m, 1)
  const inicio = new Date(primero)
  inicio.setDate(primero.getDate() - ((primero.getDay() + 6) % 7))
  const dias = []

  for (let i = 0; i < 42; i += 1) {
    const fecha = new Date(inicio)
    fecha.setDate(inicio.getDate() + i)
    dias.push({ fecha: claveFecha(fecha), dia: fecha.getDate(), enMes: fecha.getMonth() === m })
  }

  return dias
}

export default function Calendario({ mes, registros, onCambiarMes, onSeleccionarFecha }: Props) {
  const registrosPorFecha = new Map(registros.map((registro) => [registro.fecha, registro]))
  const hoyClave = hoy()
  const hoyTieneRegistro = registrosPorFecha.has(hoyClave)

  function moverMes(delta: number) {
    onCambiarMes(new Date(mes.getFullYear(), mes.getMonth() + delta, 1))
  }

  return (
    <main className="screen calendar-screen">
      <header className="home-header">
        <div>
          <h1>Elss</h1>
          <p className="muted">vamos anotando tus días</p>
        </div>
        <div className="month-control">
          <button type="button" className="icon-button" onClick={() => moverMes(-1)} aria-label="Mes anterior">‹</button>
          <span>{nombreMesTitulo(mes.getMonth())}</span>
          <button type="button" className="icon-button" onClick={() => moverMes(1)} aria-label="Mes siguiente">›</button>
        </div>
      </header>

      <section className="calendar-grid" aria-label="Calendario">
        {DIAS.map((dia, index) => <div className="day-label" key={`${dia}-${index}`}>{dia}</div>)}
        {diasDelCalendario(mes).map((dia) => {
          const registro = registrosPorFecha.get(dia.fecha)
          const style = registro ? { background: ESTADO_COLORES[registro.estado_general].fondo } : undefined
          return (
            <button
              key={dia.fecha}
              className={[
                'day-cell',
                dia.enMes ? '' : 'outside',
                dia.fecha === hoyClave ? 'today' : '',
              ].join(' ')}
              style={style}
              type="button"
              onClick={() => onSeleccionarFecha(dia.fecha)}
            >
              <span>{dia.dia}</span>
              {registro && <Carita estado={registro.estado_general} />}
            </button>
          )
        })}
      </section>

      <button
        className={hoyTieneRegistro ? 'primary-button' : 'primary-button attention'}
        type="button"
        onClick={() => onSeleccionarFecha(hoyClave)}
      >
        Registrar mi mañana
      </button>
    </main>
  )
}
