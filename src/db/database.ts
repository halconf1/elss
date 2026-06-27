import { openDB, type IDBPDatabase } from 'idb'
import type { Registro, Config } from '../types'

const DB_NAME = 'elss'
const DB_VERSION = 1

interface ElssDB {
  registros: {
    key: string
    value: Registro
    indexes: { fecha: string }
  }
  config: {
    key: string
    value: Config
  }
}

let _db: IDBPDatabase<ElssDB> | null = null

/** Solo para tests: cierra y descarta la conexión actual. */
export function resetDB(): void {
  _db?.close()
  _db = null
}

export async function getDB(): Promise<IDBPDatabase<ElssDB>> {
  if (_db) return _db

  _db = await openDB<ElssDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const registrosStore = db.createObjectStore('registros', { keyPath: 'id' })
      // Un solo registro por día — unique evita duplicados a nivel de store
      registrosStore.createIndex('fecha', 'fecha', { unique: true })

      db.createObjectStore('config', { keyPath: 'id' })
    },
  })

  return _db
}

/** Solicita almacenamiento persistente al navegador (capa 1 de respaldo). */
export async function solicitarPersistencia(): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  const concedido = await navigator.storage.persist()
  return concedido
}
