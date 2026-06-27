import type { Registro, EstadoGeneral } from '../types'
import { FACTORES, ZONAS } from '../types'

export interface Conteo {
  nombre: string
  total: number
}

export interface ResumenSemanalDatos {
  total: number
  buenos: number
  porEstado: Record<EstadoGeneral, number>
  zonasFrecuentes: Conteo[]
  rigidez30a60: number
  rigidezMas60: number
}

export interface ReporteDatos {
  total: number
  bien: number
  conMolestia: number
  dolorPromedio: number | null
  dolorMaximo: number | null
  zonasFrecuentes: Conteo[]
  rigidezMas30: number
  rigidezMas60: number
  inflamacionVisible: number
  calorEnrojecimiento: number
  mejoraMovimiento: number
  empeoraMovimiento: number
  factoresFrecuentes: Conteo[]
  notasMolestia: Array<{ fecha: string; nota: string }>
}

const ESTADOS: EstadoGeneral[] = ['bien', 'regular', 'molestia', 'mucho_dolor']

function contarValores(registros: Registro[], selector: (registro: Registro) => string[] | undefined, permitidos: readonly string[]): Conteo[] {
  const conteos = new Map<string, number>()

  for (const registro of registros) {
    for (const valor of selector(registro) ?? []) {
      if (!permitidos.includes(valor)) continue
      conteos.set(valor, (conteos.get(valor) ?? 0) + 1)
    }
  }

  return Array.from(conteos.entries())
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre))
}

export function calcularResumenSemanal(registros: Registro[]): ResumenSemanalDatos {
  const porEstado = ESTADOS.reduce<Record<EstadoGeneral, number>>((acc, estado) => {
    acc[estado] = 0
    return acc
  }, {
    bien: 0,
    regular: 0,
    molestia: 0,
    mucho_dolor: 0,
  })

  for (const registro of registros) {
    porEstado[registro.estado_general] += 1
  }

  return {
    total: registros.length,
    buenos: porEstado.bien,
    porEstado,
    zonasFrecuentes: contarValores(registros, (registro) => registro.zonas, ZONAS),
    rigidez30a60: registros.filter((registro) => registro.rigidez_duracion === '30-60').length,
    rigidezMas60: registros.filter((registro) => registro.rigidez_duracion === '>60').length,
  }
}

export function calcularReporte(registros: Registro[]): ReporteDatos {
  const conDolor = registros.filter((registro) => typeof registro.dolor_nivel === 'number')
  const dolorTotal = conDolor.reduce((total, registro) => total + (registro.dolor_nivel ?? 0), 0)
  const registrosConMolestia = registros.filter((registro) => registro.estado_general !== 'bien')

  return {
    total: registros.length,
    bien: registros.filter((registro) => registro.estado_general === 'bien').length,
    conMolestia: registrosConMolestia.length,
    dolorPromedio: conDolor.length ? Math.round((dolorTotal / conDolor.length) * 10) / 10 : null,
    dolorMaximo: conDolor.length ? Math.max(...conDolor.map((registro) => registro.dolor_nivel ?? 0)) : null,
    zonasFrecuentes: contarValores(registros, (registro) => registro.zonas, ZONAS),
    rigidezMas30: registros.filter((registro) => registro.rigidez_duracion === '30-60' || registro.rigidez_duracion === '>60').length,
    rigidezMas60: registros.filter((registro) => registro.rigidez_duracion === '>60').length,
    inflamacionVisible: registros.filter((registro) => registro.inflamacion === 'si').length,
    calorEnrojecimiento: registros.filter((registro) => registro.calor_enrojecimiento === 'si').length,
    mejoraMovimiento: registros.filter((registro) => registro.al_moverse === 'mejoro').length,
    empeoraMovimiento: registros.filter((registro) => registro.al_moverse === 'empeoro').length,
    factoresFrecuentes: contarValores(registrosConMolestia, (registro) => registro.factores, FACTORES),
    notasMolestia: registrosConMolestia
      .filter((registro) => registro.nota?.trim())
      .map((registro) => ({ fecha: registro.fecha, nota: registro.nota?.trim() ?? '' }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha)),
  }
}
