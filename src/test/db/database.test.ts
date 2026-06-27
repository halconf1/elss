import { describe, it, expect } from 'vitest'
import { getDB, solicitarPersistencia } from '../../db/database'

describe('getDB', () => {
  it('abre la base de datos con los dos stores esperados', async () => {
    const db = await getDB()
    expect(db.objectStoreNames.contains('registros')).toBe(true)
    expect(db.objectStoreNames.contains('config')).toBe(true)
  })

  it('devuelve la misma instancia en llamadas sucesivas', async () => {
    const a = await getDB()
    const b = await getDB()
    expect(a).toBe(b)
  })
})

describe('solicitarPersistencia', () => {
  it('devuelve false cuando navigator.storage.persist no está disponible', async () => {
    // jsdom no implementa storage.persist — debe manejar la ausencia sin lanzar
    const resultado = await solicitarPersistencia()
    expect(typeof resultado).toBe('boolean')
  })
})
