import { shuffle } from './shuffle.js'

describe('#shuffle', () => {
  beforeEach(() => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.3)
  })

  afterEach(() => {
    jest.spyOn(global.Math, 'random').mockRestore()
  })

  it('should shuffle array', () => {
    const shuffled = shuffle(['a', 'b', 'c', 'd', 'e'])

    expect(shuffled).toStrictEqual(['d', 'c', 'a', 'e', 'b'])
  })

  it('should accept empty array', () => {
    const shuffled = shuffle([])

    expect(shuffled).toStrictEqual([])
  })
})
