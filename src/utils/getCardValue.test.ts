import { describe, expect, test } from 'vitest'
import { getCardValue } from './getCardValue.js'

describe('#getCardValue', () => {
  test('should return the value of a card', () => {
    const value = getCardValue(13)

    expect(value).toBe(3)
  })

  test('should return value for lower deck bound', () => {
    const value = getCardValue(0)

    expect(value).toBe(0)
  })

  test('should return value for upper deck bound', () => {
    const value = getCardValue(51)

    expect(value).toBe(12)
  })
})
