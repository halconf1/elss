import { describe, it, expect } from 'vitest'
import { hashPin } from '../../lib/pin'

describe('hashPin', () => {
  it('devuelve una cadena no vacía', () => {
    expect(typeof hashPin('1234')).toBe('string')
    expect(hashPin('1234').length).toBeGreaterThan(0)
  })

  it('el mismo PIN siempre produce el mismo hash', () => {
    expect(hashPin('1234')).toBe(hashPin('1234'))
    expect(hashPin('9999')).toBe(hashPin('9999'))
  })

  it('PINs distintos producen hashes distintos', () => {
    expect(hashPin('1234')).not.toBe(hashPin('4321'))
    expect(hashPin('0000')).not.toBe(hashPin('1111'))
  })

  it('acepta cadena vacía sin lanzar error', () => {
    expect(() => hashPin('')).not.toThrow()
  })

  it('acepta PINs largos', () => {
    expect(() => hashPin('12345678')).not.toThrow()
  })
})
