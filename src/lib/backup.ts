import type { Registro } from '../types'
import { VERSION_DATOS } from '../types'
import { listarRegistros, upsertPorFecha } from '../db/registros'
import { guardarConfig } from '../db/config'

export interface BackupData {
  version: number
  exportado_en: string
  registros: Registro[]
}

export type ResultadoRespaldo = 'compartido' | 'descargado'

function descargarBlob(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nombre
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function escaparCsv(valor: string | number | undefined): string {
  const texto = valor === undefined ? '' : String(valor)
  return `"${texto.replaceAll('"', '""')}"`
}

export function registrosAJson(registros: Registro[]): string {
  const data: BackupData = {
    version: VERSION_DATOS,
    exportado_en: new Date().toISOString(),
    registros,
  }

  return JSON.stringify(data, null, 2)
}

export function registrosACsv(registros: Registro[]): string {
  const columnas = [
    'fecha',
    'estado_general',
    'dolor_nivel',
    'zonas',
    'lado',
    'rigidez_duracion',
    'inflamacion',
    'calor_enrojecimiento',
    'al_moverse',
    'factores',
    'nota',
  ]

  const filas = registros.map((registro) => [
    registro.fecha,
    registro.estado_general,
    registro.dolor_nivel,
    registro.zonas?.join('; '),
    registro.lado,
    registro.rigidez_duracion,
    registro.inflamacion,
    registro.calor_enrojecimiento,
    registro.al_moverse,
    registro.factores?.join('; '),
    registro.nota,
  ].map(escaparCsv).join(','))

  return [columnas.join(','), ...filas].join('\n')
}

export async function compartirODescargarRespaldo(): Promise<ResultadoRespaldo> {
  const registros = await listarRegistros()
  const marca = new Date().toISOString().slice(0, 10)
  const jsonFile = new File([registrosAJson(registros)], `elss-respaldo-${marca}.json`, { type: 'application/json' })
  const csvFile = new File([registrosACsv(registros)], `elss-respaldo-${marca}.csv`, { type: 'text/csv' })
  const archivos = [jsonFile, csvFile]

  if (navigator.canShare?.({ files: archivos }) && navigator.share) {
    await navigator.share({
      title: 'Respaldo Elss',
      text: 'Respaldo de mis registros de Elss.',
      files: archivos,
    })
    await guardarConfig({ ultimo_respaldo: new Date().toISOString() })
    return 'compartido'
  }

  descargarBlob(jsonFile, jsonFile.name)
  descargarBlob(csvFile, csvFile.name)
  await guardarConfig({ ultimo_respaldo: new Date().toISOString() })
  return 'descargado'
}

function esRegistro(valor: unknown): valor is Registro {
  if (!valor || typeof valor !== 'object') return false
  const registro = valor as Partial<Registro>
  return typeof registro.fecha === 'string'
    && typeof registro.estado_general === 'string'
    && typeof registro.creado_en === 'string'
    && typeof registro.actualizado_en === 'string'
}

export async function importarRespaldo(file: File): Promise<number> {
  const texto = await file.text()
  const data = JSON.parse(texto) as Partial<BackupData>

  if (data.version !== VERSION_DATOS || !Array.isArray(data.registros)) {
    throw new Error('El archivo no corresponde a esta versión de Elss.')
  }

  let importados = 0
  for (const registro of data.registros) {
    if (!esRegistro(registro)) continue
    await upsertPorFecha({
      fecha: registro.fecha,
      estado_general: registro.estado_general,
      dolor_nivel: registro.dolor_nivel,
      zonas: registro.zonas,
      lado: registro.lado,
      rigidez_duracion: registro.rigidez_duracion,
      inflamacion: registro.inflamacion,
      calor_enrojecimiento: registro.calor_enrojecimiento,
      al_moverse: registro.al_moverse,
      factores: registro.factores,
      nota: registro.nota,
    })
    importados += 1
  }

  return importados
}
