import { describe, it, expect } from 'vitest'
import { leerConfig, guardarConfig, inicializarStorage } from '../../db/config'

describe('leerConfig', () => {
  it('devuelve los defaults cuando no hay config guardada', async () => {
    const cfg = await leerConfig()
    expect(cfg.id).toBe('config')
    expect(cfg.onboarding_visto).toBe(false)
    expect(cfg.storage_persistido).toBe(false)
    expect(cfg.primer_respaldo_ofrecido).toBe(false)
    expect(cfg.pin).toBeUndefined()
    expect(cfg.ultimo_respaldo).toBeUndefined()
  })
})

describe('guardarConfig', () => {
  it('persiste un campo parcial sin sobreescribir los demás', async () => {
    await guardarConfig({ onboarding_visto: true })
    const cfg = await leerConfig()
    expect(cfg.onboarding_visto).toBe(true)
    expect(cfg.storage_persistido).toBe(false) // intacto
  })

  it('devuelve la config actualizada', async () => {
    const nueva = await guardarConfig({ onboarding_visto: true })
    expect(nueva.onboarding_visto).toBe(true)
    expect(nueva.id).toBe('config')
  })

  it('actualizar el PIN no afecta onboarding_visto', async () => {
    await guardarConfig({ onboarding_visto: true })
    await guardarConfig({ pin: 'abc123' })
    const cfg = await leerConfig()
    expect(cfg.onboarding_visto).toBe(true)
    expect(cfg.pin).toBe('abc123')
  })

  it('actualizar ultimo_respaldo lo guarda como ISO string', async () => {
    const iso = new Date().toISOString()
    await guardarConfig({ ultimo_respaldo: iso })
    const cfg = await leerConfig()
    expect(cfg.ultimo_respaldo).toBe(iso)
  })

  it('guardar la misma clave dos veces conserva el último valor', async () => {
    await guardarConfig({ onboarding_visto: true })
    await guardarConfig({ onboarding_visto: false })
    const cfg = await leerConfig()
    expect(cfg.onboarding_visto).toBe(false)
  })
})

describe('inicializarStorage', () => {
  it('no lanza error aunque navigator.storage.persist no esté disponible', async () => {
    await expect(inicializarStorage()).resolves.not.toThrow()
  })

  it('si ya se persistió, no intenta solicitarlo de nuevo', async () => {
    await guardarConfig({ storage_persistido: true })
    await expect(inicializarStorage()).resolves.not.toThrow()
  })
})
