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
    const source = ['a', 'b', 'c', 'd', 'e']

    const shuffled = shuffle(source)

    expect(shuffled).toStrictEqual(['d', 'c', 'a', 'e', 'b'])
    expect(source).toStrictEqual(['a', 'b', 'c', 'd', 'e'])
  })

  test('should accept empty array', () => {
    const shuffled = shuffle([])

    expect(shuffled).toStrictEqual([])
  })
})
