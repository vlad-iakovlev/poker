import { getPokerCardSuit } from './getPokerCardSuit.js'

describe('#getPokerCardSuit', () => {
  it('should return the suit of a card', () => {
    const suit = getPokerCardSuit(13)

    expect(suit).toBe(1)
  })
})
