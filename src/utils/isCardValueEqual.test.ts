import { isCardValueEqual } from './isCardValueEqual.js'

describe('#isCardValueEqual', () => {
  it('should return true if the values of two cards are equal', () => {
    const isEqual = isCardValueEqual(13, 15)

    expect(isEqual).toBe(true)
  })

  it('should return false if the values of two cards are not equal', () => {
    const isEqual = isCardValueEqual(13, 17)

    expect(isEqual).toBe(false)
  })
})
