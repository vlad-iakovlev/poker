import { describe, expect, test } from 'vitest'
import { isCardValueEqual } from './isCardValueEqual.js'

describe('#isCardValueEqual', () => {
  test('should return true if the values of two cards are equal', () => {
    const isEqual = isCardValueEqual(13, 15)

    expect(isEqual).toBe(true)
  })

  test('should return false if the values of two cards are not equal', () => {
    const isEqual = isCardValueEqual(13, 17)

    expect(isEqual).toBe(false)
  })
})
