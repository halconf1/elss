import { getDB } from './database'
import { solicitarPersistencia } from './database'
import type { Config } from '../types'
import { VERSION_DATOS } from '../types'

const CONFIG_DEFAULTS: Config = {
  id: 'config',
  onboarding_visto: false,
  storage_persistido: false,
  primer_respaldo_ofrecido: false,
  version_datos: VERSION_DATOS,
}

export async function leerConfig(): Promise<Config> {
  const db = await getDB()
  const guardada = await db.get('config', 'config')
  return guardada ?? { ...CONFIG_DEFAULTS }
}

export async function guardarConfig(parcial: Partial<Omit<Config, 'id'>>): Promise<Config> {
  const db = await getDB()
  const actual = await leerConfig()
  const nueva: Config = { ...actual, ...parcial, id: 'config' }
  await db.put('config', nueva)
  return nueva
}

/** Llamar al primer arranque: pide persistencia y la guarda en config. */
export async function inicializarStorage(): Promise<void> {
  const cfg = await leerConfig()
  if (!cfg.storage_persistido) {
    const concedido = await solicitarPersistencia()
    if (concedido) {
      await guardarConfig({ storage_persistido: true })
    }
  }
}
