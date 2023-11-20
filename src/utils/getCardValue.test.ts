import { getCardValue } from './getCardValue.js'

describe('#getCardValue', () => {
  it('should return the value of a card', () => {
    const value = getCardValue(13)

    expect(value).toBe(3)
  })
})
