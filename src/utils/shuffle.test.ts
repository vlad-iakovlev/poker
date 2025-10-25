import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { shuffle } from './shuffle.js'

describe('#shuffle', () => {
  beforeEach(() => {
    vi.spyOn(global.Math, 'random').mockReturnValue(0.3)
  })

  afterEach(() => {
    vi.spyOn(global.Math, 'random').mockRestore()
  })

  test('should shuffle array', () => {
    const shuffled = shuffle(['a', 'b', 'c', 'd', 'e'])

    expect(shuffled).toStrictEqual(['d', 'c', 'a', 'e', 'b'])
  })

  test('should accept empty array', () => {
    const shuffled = shuffle([])

    expect(shuffled).toStrictEqual([])
  })
})
