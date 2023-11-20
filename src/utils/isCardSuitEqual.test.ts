import { isCardSuitEqual } from './isCardSuitEqual.js'

describe('#isCardSuitEqual', () => {
  it('should return true if the suits of two cards are equal', () => {
    const isEqual = isCardSuitEqual(13, 17)

    expect(isEqual).toBe(true)
  })

  it('should return false if the suits of two cards are not equal', () => {
    const isEqual = isCardSuitEqual(13, 15)

    expect(isEqual).toBe(false)
  })
})
