import { describe, expect, test } from 'vitest'
import { getCardSuit } from './getCardSuit.js'

describe('#getCardSuit', () => {
  test('should return the suit of a card', () => {
    const suit = getCardSuit(13)

    expect(suit).toBe(1)
  })

  test('should return suit for lower deck bound', () => {
    const suit = getCardSuit(0)

    expect(suit).toBe(0)
  })

  test('should return suit for upper deck bound', () => {
    const suit = getCardSuit(51)

    expect(suit).toBe(3)
  })
})
