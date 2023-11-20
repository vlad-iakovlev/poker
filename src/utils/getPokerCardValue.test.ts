import { getPokerCardValue } from './getPokerCardValue.js'

describe('#getPokerCardValue', () => {
  it('should return the value of a card', () => {
    const value = getPokerCardValue(13)

    expect(value).toBe(3)
  })
})
