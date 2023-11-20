import { isPokerCardValueEqual } from './isPokerCardValueEqual.js'

describe('#isPokerCardValueEqual', () => {
  it('should return true if the values of two cards are equal', () => {
    const isEqual = isPokerCardValueEqual(13, 15)

    expect(isEqual).toBe(true)
  })

  it('should return false if the values of two cards are not equal', () => {
    const isEqual = isPokerCardValueEqual(13, 17)

    expect(isEqual).toBe(false)
  })
})
