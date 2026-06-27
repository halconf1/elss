import { describe, it, expect } from 'vitest'
import {
  upsertPorFecha,
  obtenerPorFecha,
  listarRegistros,
  listarPorRango,
  borrarRegistro,
  borrarTodo,
} from '../../db/registros'

function datosBase(fecha: string) {
  return { fecha, estado_general: 'bien' as const }
}

function datosCompletos(fecha: string) {
  return {
    fecha,
    estado_general: 'molestia' as const,
    dolor_nivel: 6,
    zonas: ['rodillas', 'manos'],
    lado: 'ambos' as const,
    rigidez_duracion: '15-30' as const,
    inflamacion: 'poco' as const,
    calor_enrojecimiento: 'no' as const,
    al_moverse: 'igual' as const,
    factores: ['dormí mal'],
    nota: 'prueba',
  }
}

// ── upsertPorFecha ─────────────────────────────────────────────────────────────

describe('upsertPorFecha', () => {
  it('crea un registro nuevo con id y timestamps', async () => {
    const r = await upsertPorFecha(datosBase('2026-06-01'))
    expect(r.id).toBeTruthy()
    expect(r.fecha).toBe('2026-06-01')
    expect(r.creado_en).toBeTruthy()
    expect(r.actualizado_en).toBeTruthy()
  })

  it('el id es un UUID v4 válido', async () => {
    const r = await upsertPorFecha(datosBase('2026-06-02'))
    expect(r.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  })

  it('al actualizar la misma fecha preserva el id original y actualiza actualizado_en', async () => {
    const original = await upsertPorFecha(datosBase('2026-06-03'))
    await new Promise((r) => setTimeout(r, 5))
    const actualizado = await upsertPorFecha({ ...datosBase('2026-06-03'), estado_general: 'regular' })

    expect(actualizado.id).toBe(original.id)
    expect(actualizado.creado_en).toBe(original.creado_en)
    expect(actualizado.estado_general).toBe('regular')
    expect(actualizado.actualizado_en).not.toBe(original.actualizado_en)
  })

  it('guarda correctamente todos los campos opcionales', async () => {
    const r = await upsertPorFecha(datosCompletos('2026-06-04'))
    expect(r.dolor_nivel).toBe(6)
    expect(r.zonas).toEqual(['rodillas', 'manos'])
    expect(r.nota).toBe('prueba')
  })
})

// ── obtenerPorFecha ───────────────────────────────────────────────────────────

describe('obtenerPorFecha', () => {
  it('devuelve undefined para una fecha sin registro', async () => {
    const r = await obtenerPorFecha('2099-01-01')
    expect(r).toBeUndefined()
  })

  it('devuelve el registro guardado', async () => {
    await upsertPorFecha(datosBase('2026-07-01'))
    const r = await obtenerPorFecha('2026-07-01')
    expect(r?.fecha).toBe('2026-07-01')
  })
})

// ── listarRegistros ───────────────────────────────────────────────────────────

describe('listarRegistros', () => {
  it('lista vacía si no hay registros', async () => {
    const lista = await listarRegistros()
    expect(lista).toHaveLength(0)
  })

  it('devuelve todos los registros ordenados de más reciente a más antiguo', async () => {
    await upsertPorFecha(datosBase('2026-06-01'))
    await upsertPorFecha(datosBase('2026-06-10'))
    await upsertPorFecha(datosBase('2026-06-05'))
    const lista = await listarRegistros()
    expect(lista).toHaveLength(3)
    expect(lista[0].fecha).toBe('2026-06-10')
    expect(lista[1].fecha).toBe('2026-06-05')
    expect(lista[2].fecha).toBe('2026-06-01')
  })
})

// ── listarPorRango ────────────────────────────────────────────────────────────

describe('listarPorRango', () => {
  it('devuelve solo los registros dentro del rango (inclusive)', async () => {
    await upsertPorFecha(datosBase('2026-06-01'))
    await upsertPorFecha(datosBase('2026-06-10'))
    await upsertPorFecha(datosBase('2026-06-20'))

    const lista = await listarPorRango('2026-06-05', '2026-06-15')
    expect(lista).toHaveLength(1)
    expect(lista[0].fecha).toBe('2026-06-10')
  })

  it('incluye los extremos del rango', async () => {
    await upsertPorFecha(datosBase('2026-06-01'))
    await upsertPorFecha(datosBase('2026-06-30'))

    const lista = await listarPorRango('2026-06-01', '2026-06-30')
    expect(lista).toHaveLength(2)
  })

  it('devuelve vacío si no hay registros en el rango', async () => {
    await upsertPorFecha(datosBase('2026-06-01'))
    const lista = await listarPorRango('2026-07-01', '2026-07-31')
    expect(lista).toHaveLength(0)
  })
})

// ── borrarRegistro ────────────────────────────────────────────────────────────

describe('borrarRegistro', () => {
  it('elimina el registro por id', async () => {
    const r = await upsertPorFecha(datosBase('2026-08-01'))
    await borrarRegistro(r.id)
    const resultado = await obtenerPorFecha('2026-08-01')
    expect(resultado).toBeUndefined()
  })

  it('no lanza error si el id no existe', async () => {
    await expect(borrarRegistro('id-inexistente')).resolves.not.toThrow()
  })
})

// ── borrarTodo ────────────────────────────────────────────────────────────────

describe('borrarTodo', () => {
  it('elimina todos los registros', async () => {
    await upsertPorFecha(datosBase('2026-06-01'))
    await upsertPorFecha(datosBase('2026-06-02'))
    await borrarTodo()
    const lista = await listarRegistros()
    expect(lista).toHaveLength(0)
  })

  it('no lanza error si ya estaba vacío', async () => {
    await expect(borrarTodo()).resolves.not.toThrow()
  })
})
