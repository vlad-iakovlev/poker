import { describe, expect, test } from 'vitest'
import { isCardSuitEqual } from './isCardSuitEqual.js'

describe('#isCardSuitEqual', () => {
  test('should return true if the suits of two cards are equal', () => {
    const isEqual = isCardSuitEqual(13, 17)

    expect(isEqual).toBe(true)
  })

  test('should return false if the suits of two cards are not equal', () => {
    const isEqual = isCardSuitEqual(13, 15)

    expect(isEqual).toBe(false)
  })
})
