import { describe, expect, test } from 'vitest'
import { getCardValue } from './getCardValue.js'

describe('#getCardValue', () => {
  test('should return the value of a card', () => {
    const value = getCardValue(13)

    expect(value).toBe(3)
  })
})
