import { describe, it, expect, vi, beforeEach } from 'vitest'
import { compartirODescargarRespaldo, registrosAJson, registrosACsv, importarRespaldo } from '../../lib/backup'
import { guardarConfig } from '../../db/config'
import { listarRegistros } from '../../db/registros'
import type { Registro } from '../../types'
import { VERSION_DATOS } from '../../types'

// Mock db/registros para evitar IndexedDB real en este módulo
vi.mock('../../db/registros', () => ({
  listarRegistros: vi.fn(async () => []),
  upsertPorFecha: vi.fn(async () => undefined),
}))
vi.mock('../../db/config', () => ({
  guardarConfig: vi.fn(async () => undefined),
}))

function crearRegistro(fecha: string): Registro {
  return {
    id: crypto.randomUUID(),
    fecha,
    estado_general: 'bien',
    creado_en: new Date().toISOString(),
    actualizado_en: new Date().toISOString(),
  }
}

function crearRegistroCompleto(fecha: string): Registro {
  return {
    id: crypto.randomUUID(),
    fecha,
    estado_general: 'molestia',
    dolor_nivel: 5,
    zonas: ['rodillas', 'manos'],
    lado: 'ambos',
    rigidez_duracion: '15-30',
    inflamacion: 'poco',
    calor_enrojecimiento: 'no',
    al_moverse: 'igual',
    factores: ['dormí mal', 'frío'],
    nota: 'Nota de prueba con "comillas"',
    creado_en: new Date().toISOString(),
    actualizado_en: new Date().toISOString(),
  }
}

// ── registrosAJson ─────────────────────────────────────────────────────────────

describe('registrosAJson', () => {
  it('produce JSON parseable', () => {
    const registros = [crearRegistro('2026-06-27')]
    const json = registrosAJson(registros)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('incluye la versión y el campo exportado_en', () => {
    const data = JSON.parse(registrosAJson([]))
    expect(data.version).toBe(VERSION_DATOS)
    expect(typeof data.exportado_en).toBe('string')
  })

  it('incluye todos los registros pasados', () => {
    const registros = [crearRegistro('2026-06-25'), crearRegistro('2026-06-26')]
    const data = JSON.parse(registrosAJson(registros))
    expect(data.registros).toHaveLength(2)
  })

  it('preserva todos los campos del registro', () => {
    const r = crearRegistroCompleto('2026-06-27')
    const data = JSON.parse(registrosAJson([r]))
    const r2 = data.registros[0]
    expect(r2.fecha).toBe('2026-06-27')
    expect(r2.estado_general).toBe('molestia')
    expect(r2.dolor_nivel).toBe(5)
    expect(r2.zonas).toEqual(['rodillas', 'manos'])
    expect(r2.nota).toBe('Nota de prueba con "comillas"')
  })
})

// ── registrosACsv ──────────────────────────────────────────────────────────────

describe('registrosACsv', () => {
  it('produce al menos una línea de encabezado', () => {
    const csv = registrosACsv([])
    const lineas = csv.split('\n')
    expect(lineas.length).toBeGreaterThanOrEqual(1)
    expect(lineas[0]).toContain('fecha')
    expect(lineas[0]).toContain('estado_general')
  })

  it('produce una fila por registro', () => {
    const registros = [crearRegistro('2026-06-25'), crearRegistro('2026-06-26')]
    const csv = registrosACsv(registros)
    const lineas = csv.split('\n')
    expect(lineas).toHaveLength(3) // header + 2 filas
  })

  it('escapa comillas en la nota', () => {
    const r = crearRegistroCompleto('2026-06-27')
    const csv = registrosACsv([r])
    expect(csv).toContain('""comillas""')
  })

  it('serializa arrays (zonas, factores) con punto y coma', () => {
    const r = crearRegistroCompleto('2026-06-27')
    const csv = registrosACsv([r])
    expect(csv).toContain('rodillas; manos')
    expect(csv).toContain('dormí mal; frío')
  })

  it('las celdas vacías quedan como cadena vacía entre comillas', () => {
    const r = crearRegistro('2026-06-27')
    const csv = registrosACsv([r])
    expect(csv).toContain('""')
  })
})

// ── importarRespaldo ───────────────────────────────────────────────────────────

describe('importarRespaldo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function crearArchivo(contenido: string): File {
    return new File([contenido], 'respaldo.json', { type: 'application/json' })
  }

  it('rechaza archivos con versión incorrecta', async () => {
    const datos = { version: 999, exportado_en: new Date().toISOString(), registros: [] }
    const archivo = crearArchivo(JSON.stringify(datos))
    await expect(importarRespaldo(archivo)).rejects.toThrow()
  })

  it('rechaza archivos sin array de registros', async () => {
    const datos = { version: VERSION_DATOS, exportado_en: new Date().toISOString() }
    const archivo = crearArchivo(JSON.stringify(datos))
    await expect(importarRespaldo(archivo)).rejects.toThrow()
  })

  it('importa cero registros de un backup vacío válido', async () => {
    const { upsertPorFecha } = await import('../../db/registros')
    const datos = { version: VERSION_DATOS, exportado_en: new Date().toISOString(), registros: [] }
    const archivo = crearArchivo(JSON.stringify(datos))
    const total = await importarRespaldo(archivo)
    expect(total).toBe(0)
    expect(upsertPorFecha).not.toHaveBeenCalled()
  })

  it('importa registros válidos y llama upsertPorFecha por cada uno', async () => {
    const { upsertPorFecha } = await import('../../db/registros')
    const registros = [crearRegistro('2026-06-25'), crearRegistro('2026-06-26')]
    const datos = { version: VERSION_DATOS, exportado_en: new Date().toISOString(), registros }
    const archivo = crearArchivo(JSON.stringify(datos))
    const total = await importarRespaldo(archivo)
    expect(total).toBe(2)
    expect(upsertPorFecha).toHaveBeenCalledTimes(2)
  })

  it('omite silenciosamente registros mal formados (sin fecha)', async () => {
    const { upsertPorFecha } = await import('../../db/registros')
    const registros = [
      crearRegistro('2026-06-25'),
      { id: 'x', estado_general: 'bien' }, // le falta fecha, creado_en, actualizado_en
    ]
    const datos = { version: VERSION_DATOS, exportado_en: new Date().toISOString(), registros }
    const archivo = crearArchivo(JSON.stringify(datos))
    const total = await importarRespaldo(archivo)
    expect(total).toBe(1)
    expect(upsertPorFecha).toHaveBeenCalledTimes(1)
  })
})

// ── compartirODescargarRespaldo ───────────────────────────────────────────────

describe('compartirODescargarRespaldo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: undefined,
    })
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    })
  })

  it('usa navigator.share cuando el navegador puede compartir archivos', async () => {
    const share = vi.fn(async () => undefined)
    const canShare = vi.fn(() => true)
    const registros = [crearRegistro('2026-06-27')]
    vi.mocked(listarRegistros).mockResolvedValueOnce(registros)

    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: canShare,
    })
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: share,
    })

    const resultado = await compartirODescargarRespaldo()

    expect(resultado).toBe('compartido')
    expect(canShare).toHaveBeenCalledWith({ files: expect.arrayContaining([expect.any(File), expect.any(File)]) })
    expect(share).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Respaldo Elss',
      text: 'Respaldo de mis registros de Elss.',
      files: expect.arrayContaining([expect.any(File), expect.any(File)]),
    }))
    expect(guardarConfig).toHaveBeenCalledWith({ ultimo_respaldo: expect.any(String) })
  })

  it('descarga JSON y CSV cuando no puede compartir archivos', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:respaldo')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    vi.mocked(listarRegistros).mockResolvedValueOnce([crearRegistro('2026-06-27')])

    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: vi.fn(() => false),
    })

    const resultado = await compartirODescargarRespaldo()

    expect(resultado).toBe('descargado')
    expect(createObjectURL).toHaveBeenCalledTimes(2)
    expect(click).toHaveBeenCalledTimes(2)
    expect(revokeObjectURL).toHaveBeenCalledTimes(2)
    expect(guardarConfig).toHaveBeenCalledWith({ ultimo_respaldo: expect.any(String) })
  })
})
