import type { Registro } from '../types'
import { calcularResumenSemanal } from '../lib/stats'

interface Props {
  registros: Registro[]
}

export default function ResumenSemanal({ registros }: Props) {
  const resumen = calcularResumenSemanal(registros)
  const zonaPrincipal = resumen.zonasFrecuentes[0]
  const rigidezTexto = resumen.rigidezMas60 > 0
    ? `La rigidez pasó de 1 hora en ${resumen.rigidezMas60} día${resumen.rigidezMas60 === 1 ? '' : 's'}.`
    : resumen.rigidez30a60 > 0
      ? `La rigidez pasó de 30 min en ${resumen.rigidez30a60} día${resumen.rigidez30a60 === 1 ? '' : 's'}.`
      : 'La rigidez larga no apareció en estos días.'

  return (
    <main className="screen content-screen">
      <h2>Resumen</h2>
      {resumen.total === 0 ? (
        <p className="empty-text">Aquí verás cómo han sido tus mañanas.</p>
      ) : (
        <section className="soft-panel">
          <p>Esta semana amaneciste bien {resumen.buenos} de {resumen.total} días.</p>
          <p>
            {zonaPrincipal
              ? `Los días con molestia fueron sobre todo en: ${zonaPrincipal.nombre}.`
              : 'No hay zonas repetidas en estos días.'}
          </p>
          <p>{rigidezTexto}</p>
        </section>
      )}
    </main>
  )
}
