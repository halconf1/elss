import { describe, it, expect } from 'vitest'
import { calcularResumenSemanal, calcularReporte } from '../../lib/stats'
import type { Registro } from '../../types'

function crearRegistro(overrides: Partial<Registro> & { fecha: string; estado_general: Registro['estado_general'] }): Registro {
  return {
    id: crypto.randomUUID(),
    creado_en: new Date().toISOString(),
    actualizado_en: new Date().toISOString(),
    ...overrides,
  }
}

const BIEN = crearRegistro({ fecha: '2026-06-21', estado_general: 'bien' })
const BIEN_2 = crearRegistro({ fecha: '2026-06-22', estado_general: 'bien' })
const BIEN_3 = crearRegistro({ fecha: '2026-06-23', estado_general: 'bien' })
const REGULAR = crearRegistro({ fecha: '2026-06-24', estado_general: 'regular', dolor_nivel: 3, zonas: ['rodillas', 'manos'], rigidez_duracion: '15-30' })
const MOLESTIA = crearRegistro({
  fecha: '2026-06-25',
  estado_general: 'molestia',
  dolor_nivel: 6,
  zonas: ['rodillas', 'cuello'],
  lado: 'ambos',
  rigidez_duracion: '30-60',
  inflamacion: 'poco',
  calor_enrojecimiento: 'no',
  al_moverse: 'mejoro',
  factores: ['dormí mal', 'frío'],
  nota: 'Mucho frío por la noche',
})
const MUCHO = crearRegistro({
  fecha: '2026-06-26',
  estado_general: 'mucho_dolor',
  dolor_nivel: 9,
  zonas: ['rodillas'],
  rigidez_duracion: '>60',
  inflamacion: 'si',
  calor_enrojecimiento: 'si',
  al_moverse: 'empeoro',
  factores: ['cargué cosas'],
  nota: 'Peor día de la semana',
})

const SEMANA = [BIEN, BIEN_2, BIEN_3, REGULAR, MOLESTIA, MUCHO]

// ── calcularResumenSemanal ─────────────────────────────────────────────────────

describe('calcularResumenSemanal', () => {
  it('lista vacía → todo en cero', () => {
    const r = calcularResumenSemanal([])
    expect(r.total).toBe(0)
    expect(r.buenos).toBe(0)
    expect(r.zonasFrecuentes).toHaveLength(0)
  })

  it('cuenta el total y los días buenos correctamente', () => {
    const r = calcularResumenSemanal(SEMANA)
    expect(r.total).toBe(6)
    expect(r.buenos).toBe(3)
  })

  it('cuenta por estado correctamente', () => {
    const r = calcularResumenSemanal(SEMANA)
    expect(r.porEstado.bien).toBe(3)
    expect(r.porEstado.regular).toBe(1)
    expect(r.porEstado.molestia).toBe(1)
    expect(r.porEstado.mucho_dolor).toBe(1)
  })

  it('ordena zonas frecuentes de mayor a menor', () => {
    const r = calcularResumenSemanal(SEMANA)
    // rodillas aparece en REGULAR + MOLESTIA + MUCHO = 3 veces (más frecuente)
    expect(r.zonasFrecuentes[0].nombre).toBe('rodillas')
    expect(r.zonasFrecuentes[0].total).toBe(3)
  })

  it('cuenta rigidez 30-60 correctamente', () => {
    const r = calcularResumenSemanal(SEMANA)
    expect(r.rigidez30a60).toBe(1) // solo MOLESTIA
  })

  it('cuenta rigidez >60 correctamente', () => {
    const r = calcularResumenSemanal(SEMANA)
    expect(r.rigidezMas60).toBe(1) // solo MUCHO
  })

  it('con solo días buenos no hay zonas frecuentes', () => {
    const r = calcularResumenSemanal([BIEN, BIEN_2])
    expect(r.zonasFrecuentes).toHaveLength(0)
  })
})

// ── calcularReporte ────────────────────────────────────────────────────────────

describe('calcularReporte', () => {
  it('lista vacía → datos en cero / null', () => {
    const r = calcularReporte([])
    expect(r.total).toBe(0)
    expect(r.dolorPromedio).toBeNull()
    expect(r.dolorMaximo).toBeNull()
    expect(r.notasMolestia).toHaveLength(0)
  })

  it('cuenta bien y conMolestia correctamente', () => {
    const r = calcularReporte(SEMANA)
    expect(r.bien).toBe(3)
    expect(r.conMolestia).toBe(3)
  })

  it('calcula dolor promedio de registros con dolor_nivel definido', () => {
    const r = calcularReporte(SEMANA)
    // REGULAR=3, MOLESTIA=6, MUCHO=9 → promedio = 6
    expect(r.dolorPromedio).toBe(6)
  })

  it('calcula dolor máximo correctamente', () => {
    const r = calcularReporte(SEMANA)
    expect(r.dolorMaximo).toBe(9)
  })

  it('cuenta rigidez correctamente', () => {
    const r = calcularReporte(SEMANA)
    expect(r.rigidezMas30).toBe(2) // MOLESTIA(30-60) + MUCHO(>60)
    expect(r.rigidezMas60).toBe(1) // solo MUCHO
  })

  it('cuenta inflamación visible (si)', () => {
    const r = calcularReporte(SEMANA)
    expect(r.inflamacionVisible).toBe(1) // solo MUCHO
  })

  it('cuenta calor/enrojecimiento (si)', () => {
    const r = calcularReporte(SEMANA)
    expect(r.calorEnrojecimiento).toBe(1) // solo MUCHO
  })

  it('cuenta mejora con movimiento', () => {
    const r = calcularReporte(SEMANA)
    expect(r.mejoraMovimiento).toBe(1) // MOLESTIA
  })

  it('cuenta empeora con movimiento', () => {
    const r = calcularReporte(SEMANA)
    expect(r.empeoraMovimiento).toBe(1) // MUCHO
  })

  it('incluye notas solo de días con molestia y las ordena por fecha', () => {
    const r = calcularReporte(SEMANA)
    expect(r.notasMolestia).toHaveLength(2)
    expect(r.notasMolestia[0].fecha).toBe('2026-06-25')
    expect(r.notasMolestia[0].nota).toBe('Mucho frío por la noche')
    expect(r.notasMolestia[1].fecha).toBe('2026-06-26')
  })

  it('factores frecuentes vienen de días con molestia, no de días bien', () => {
    const r = calcularReporte(SEMANA)
    const nombres = r.factoresFrecuentes.map((f) => f.nombre)
    expect(nombres).not.toContain('no sé') // nadie lo usó
    expect(nombres.length).toBeGreaterThan(0)
  })

  it('zonas frecuentes de toda la semana incluyendo días bien (sin zonas)', () => {
    const r = calcularReporte(SEMANA)
    expect(r.zonasFrecuentes[0].nombre).toBe('rodillas')
  })

  it('si todos los registros son "bien" no hay notas de molestia', () => {
    const r = calcularReporte([BIEN, BIEN_2])
    expect(r.notasMolestia).toHaveLength(0)
    expect(r.conMolestia).toBe(0)
    expect(r.dolorMaximo).toBeNull()
  })
})
