import { getCardSuit } from './getCardSuit.js'

describe('#getCardSuit', () => {
  it('should return the suit of a card', () => {
    const suit = getCardSuit(13)

    expect(suit).toBe(1)
  })
})
