import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  hoy,
  claveFecha,
  nombreMes,
  nombreMesTitulo,
  rangoSemana,
  rangoMes,
  formatearFecha,
  formatearHora,
  diasDesde,
} from '../../lib/fechas'

describe('claveFecha', () => {
  it('formatea una fecha como YYYY-MM-DD', () => {
    expect(claveFecha(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(claveFecha(new Date(2026, 11, 31))).toBe('2026-12-31')
    expect(claveFecha(new Date(2026, 5, 27))).toBe('2026-06-27')
  })

  it('rellena con ceros los meses y días de un dígito', () => {
    expect(claveFecha(new Date(2026, 0, 1))).toBe('2026-01-01')
  })
})

describe('hoy', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 27, 10, 0, 0))
  })
  afterEach(() => vi.useRealTimers())

  it('devuelve la fecha de hoy en YYYY-MM-DD', () => {
    expect(hoy()).toBe('2026-06-27')
  })
})

describe('nombreMes', () => {
  it('devuelve el nombre del mes en minúsculas', () => {
    expect(nombreMes(0)).toBe('enero')
    expect(nombreMes(5)).toBe('junio')
    expect(nombreMes(11)).toBe('diciembre')
  })

  it('devuelve cadena vacía para índices fuera de rango', () => {
    expect(nombreMes(12)).toBe('')
    expect(nombreMes(-1)).toBe('')
  })
})

describe('nombreMesTitulo', () => {
  it('devuelve el mes con primera letra en mayúscula', () => {
    expect(nombreMesTitulo(0)).toBe('Enero')
    expect(nombreMesTitulo(5)).toBe('Junio')
  })
})

describe('rangoSemana', () => {
  it('devuelve lunes a domingo de la semana dada (lunes como inicio)', () => {
    // 22 jun 2026 es lunes
    const fecha = new Date(2026, 5, 24) // miércoles
    const rango = rangoSemana(fecha)
    expect(rango.desde).toBe('2026-06-22')
    expect(rango.hasta).toBe('2026-06-28')
  })

  it('si la fecha es domingo, el lunes de esa semana está 6 días antes', () => {
    const domingo = new Date(2026, 5, 28) // domingo 28 jun
    const rango = rangoSemana(domingo)
    expect(rango.desde).toBe('2026-06-22')
    expect(rango.hasta).toBe('2026-06-28')
  })

  it('si la fecha es lunes, es el inicio de la semana', () => {
    const lunes = new Date(2026, 5, 22)
    const rango = rangoSemana(lunes)
    expect(rango.desde).toBe('2026-06-22')
    expect(rango.hasta).toBe('2026-06-28')
  })
})

describe('rangoMes', () => {
  it('devuelve primer y último día del mes', () => {
    const enero = new Date(2026, 0, 15)
    const rango = rangoMes(enero)
    expect(rango.desde).toBe('2026-01-01')
    expect(rango.hasta).toBe('2026-01-31')
  })

  it('maneja correctamente febrero en año no bisiesto', () => {
    const febrero = new Date(2026, 1, 10)
    const rango = rangoMes(febrero)
    expect(rango.desde).toBe('2026-02-01')
    expect(rango.hasta).toBe('2026-02-28')
  })

  it('maneja correctamente febrero en año bisiesto', () => {
    const febrero = new Date(2024, 1, 5)
    const rango = rangoMes(febrero)
    expect(rango.desde).toBe('2024-02-01')
    expect(rango.hasta).toBe('2024-02-29')
  })
})

describe('formatearFecha', () => {
  it('formatea YYYY-MM-DD como "D mes YYYY"', () => {
    expect(formatearFecha('2026-06-27')).toBe('27 junio 2026')
    expect(formatearFecha('2026-01-01')).toBe('1 enero 2026')
  })

  it('acepta ISO completo sin desfase', () => {
    const resultado = formatearFecha('2026-06-27T12:00:00.000Z')
    expect(resultado).toContain('2026')
  })
})

describe('formatearHora', () => {
  it('devuelve una cadena no vacía con formato de hora', () => {
    const resultado = formatearHora('2026-06-27T08:15:00.000Z')
    expect(resultado).toMatch(/\d/)
  })
})

describe('diasDesde', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-27T12:00:00.000Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('devuelve 0 si la fecha es hoy', () => {
    expect(diasDesde('2026-06-27T06:00:00.000Z')).toBe(0)
  })

  it('devuelve 7 si la fecha fue hace 7 días', () => {
    expect(diasDesde('2026-06-20T12:00:00.000Z')).toBe(7)
  })

  it('devuelve número positivo para fechas pasadas', () => {
    expect(diasDesde('2026-01-01T00:00:00.000Z')).toBeGreaterThan(0)
  })
})
