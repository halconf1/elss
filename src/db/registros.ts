import { getDB } from './database'
import type { Registro } from '../types'

/**
 * Guarda o actualiza el registro del día indicado.
 * Si ya existe un registro para esa fecha, lo sobreescribe preservando
 * el id y creado_en originales.
 */
export async function upsertPorFecha(
  datos: Omit<Registro, 'id' | 'creado_en' | 'actualizado_en'>
): Promise<Registro> {
  const db = await getDB()
  const ahora = new Date().toISOString()

  const existente = await db.getFromIndex('registros', 'fecha', datos.fecha)

  const registro: Registro = {
    ...datos,
    id: existente?.id ?? crypto.randomUUID(),
    creado_en: existente?.creado_en ?? ahora,
    actualizado_en: ahora,
  }

  await db.put('registros', registro)
  return registro
}

/** Devuelve el registro de una fecha concreta, o undefined si no existe. */
export async function obtenerPorFecha(fecha: string): Promise<Registro | undefined> {
  const db = await getDB()
  return db.getFromIndex('registros', 'fecha', fecha)
}

/** Lista todos los registros, ordenados de más reciente a más antiguo. */
export async function listarRegistros(): Promise<Registro[]> {
  const db = await getDB()
  const todos = await db.getAll('registros')
  return todos.sort((a, b) => b.fecha.localeCompare(a.fecha))
}

/** Lista registros dentro de un rango de fechas (inclusive en ambos extremos). */
export async function listarPorRango(desde: string, hasta: string): Promise<Registro[]> {
  const db = await getDB()
  // El índice "fecha" es string YYYY-MM-DD; IDBKeyRange funciona lexicográficamente.
  const rango = IDBKeyRange.bound(desde, hasta)
  const todos = await db.getAllFromIndex('registros', 'fecha', rango)
  return todos.sort((a, b) => b.fecha.localeCompare(a.fecha))
}

/** Elimina un registro por su id. */
export async function borrarRegistro(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('registros', id)
}

/** Borra todos los registros. No toca la config. */
export async function borrarTodo(): Promise<void> {
  const db = await getDB()
  await db.clear('registros')
}
