import { describe, expect, test } from 'vitest'
import { getCardSuit } from './getCardSuit.js'

describe('#getCardSuit', () => {
  test('should return the suit of a card', () => {
    const suit = getCardSuit(13)

    expect(suit).toBe(1)
  })
})
