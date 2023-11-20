import { isPokerCardSuitEqual } from './isPokerCardSuitEqual.js'

describe('#isPokerCardSuitEqual', () => {
  it('should return true if the suits of two cards are equal', () => {
    const isEqual = isPokerCardSuitEqual(13, 17)

    expect(isEqual).toBe(true)
  })

  it('should return false if the suits of two cards are not equal', () => {
    const isEqual = isPokerCardSuitEqual(13, 15)

    expect(isEqual).toBe(false)
  })
})
