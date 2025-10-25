import { describe, expect, test } from 'vitest'
import { Subset } from './Subset.js'

describe('Subset', () => {
  describe('#constructor', () => {
    test('should set cards', () => {
      const subset = new Subset([1, 2, 3, 4, 5])

      expect(subset.cards).toStrictEqual([1, 2, 3, 4, 5])
    })
  })

  describe('#royalFlush', () => {
    test('should return undefined when subset is not starts with ace', () => {
      const subset = new Subset([
        (10 << 2) + 1,
        (9 << 2) + 1,
        (8 << 2) + 1,
        (7 << 2) + 1,
        (6 << 2) + 1,
      ])

      expect(subset.royalFlush).toBeUndefined()
    })

    test('should return undefined when subset is starts with ace but not a flush', () => {
      const subset = new Subset([
        (12 << 2) + 1,
        (11 << 2) + 1,
        (10 << 2) + 0,
        (9 << 2) + 1,
        (8 << 2) + 1,
      ])

      expect(subset.royalFlush).toBeUndefined()
    })

    test('should return undefined when subset is starts with ace and a flush but not a straight', () => {
      const subset = new Subset([
        (12 << 2) + 1,
        (11 << 2) + 1,
        (10 << 2) + 1,
        (9 << 2) + 1,
        (7 << 2) + 1,
      ])

      expect(subset.royalFlush).toBeUndefined()
    })

    test('should return subset when subset is starts with ace and a flush and a strait', () => {
      const subset = new Subset([
        (12 << 2) + 1,
        (11 << 2) + 1,
        (10 << 2) + 1,
        (9 << 2) + 1,
        (8 << 2) + 1,
      ])

      expect(subset.royalFlush).toStrictEqual(
        new Subset([
          (12 << 2) + 1,
          (11 << 2) + 1,
          (10 << 2) + 1,
          (9 << 2) + 1,
          (8 << 2) + 1,
        ]),
      )
    })
  })

  describe('#straightFlush', () => {
    test('should return undefined when subset is not a flush', () => {
      const subset = new Subset([
        (10 << 2) + 1,
        (8 << 2) + 1,
        (6 << 2) + 0,
        (4 << 2) + 1,
        (2 << 2) + 1,
      ])

      expect(subset.straightFlush).toBeUndefined()
    })

    test('should return undefined when subset is a flush but not a strait', () => {
      const subset = new Subset([
        (10 << 2) + 1,
        (8 << 2) + 1,
        (6 << 2) + 1,
        (4 << 2) + 1,
        (2 << 2) + 1,
      ])

      expect(subset.straightFlush).toBeUndefined()
    })

    test('should return subset when subset is a flush and a strait', () => {
      const subset = new Subset([
        (10 << 2) + 1,
        (9 << 2) + 1,
        (8 << 2) + 1,
        (7 << 2) + 1,
        (6 << 2) + 1,
      ])

      expect(subset.straightFlush).toStrictEqual(
        new Subset([
          (10 << 2) + 1,
          (9 << 2) + 1,
          (8 << 2) + 1,
          (7 << 2) + 1,
          (6 << 2) + 1,
        ]),
      )
    })
  })

  describe('#fourOfKind', () => {
    test('should return undefined when subset is not a four of a kind', () => {
      const subset = new Subset([
        (10 << 2) + 1,
        (8 << 2) + 1,
        (6 << 2) + 0,
        (4 << 2) + 1,
        (2 << 2) + 1,
      ])

      expect(subset.fourOfKind).toBeUndefined()
    })

    test('should return subset when subset is a four of a kind', () => {
      const subset = new Subset([
        (4 << 2) + 0,
        (2 << 2) + 0,
        (2 << 2) + 1,
        (2 << 2) + 2,
        (2 << 2) + 3,
      ])

      expect(subset.fourOfKind).toStrictEqual(
        new Subset([
          (2 << 2) + 0,
          (2 << 2) + 1,
          (2 << 2) + 2,
          (2 << 2) + 3,
          (4 << 2) + 0,
        ]),
      )
    })
  })

  describe('#fullHouse', () => {
    test('should return undefined when subset is not a full house', () => {
      const subset = new Subset([
        (10 << 2) + 1,
        (8 << 2) + 1,
        (6 << 2) + 0,
        (4 << 2) + 1,
        (2 << 2) + 1,
      ])

      expect(subset.fullHouse).toBeUndefined()
    })

    test('should return subset when subset is a full house #1', () => {
      const subset = new Subset([
        (4 << 2) + 0,
        (4 << 2) + 1,
        (4 << 2) + 2,
        (2 << 2) + 2,
        (2 << 2) + 3,
      ])

      expect(subset.fullHouse).toStrictEqual(
        new Subset([
          (4 << 2) + 0,
          (4 << 2) + 1,
          (4 << 2) + 2,
          (2 << 2) + 2,
          (2 << 2) + 3,
        ]),
      )
    })

    test('should return subset when subset is a full house #2', () => {
      const subset = new Subset([
        (4 << 2) + 0,
        (4 << 2) + 1,
        (2 << 2) + 1,
        (2 << 2) + 2,
        (2 << 2) + 3,
      ])

      expect(subset.fullHouse).toStrictEqual(
        new Subset([
          (2 << 2) + 1,
          (2 << 2) + 2,
          (2 << 2) + 3,
          (4 << 2) + 0,
          (4 << 2) + 1,
        ]),
      )
    })
  })

  describe('#flush', () => {
    test('should return undefined when subset is not a flush', () => {
      const subset = new Subset([
        (10 << 2) + 1,
        (8 << 2) + 1,
        (6 << 2) + 0,
        (4 << 2) + 1,
        (2 << 2) + 1,
      ])

      expect(subset.flush).toBeUndefined()
    })

    test('should return subset when subset is a flush', () => {
      const subset = new Subset([
        (10 << 2) + 1,
        (8 << 2) + 1,
        (6 << 2) + 1,
        (4 << 2) + 1,
        (2 << 2) + 1,
      ])

      expect(subset.flush).toStrictEqual(
        new Subset([
          (10 << 2) + 1,
          (8 << 2) + 1,
          (6 << 2) + 1,
          (4 << 2) + 1,
          (2 << 2) + 1,
        ]),
      )
    })
  })

  describe('#straight', () => {
    test('should return undefined when subset is not a straight', () => {
      const subset = new Subset([
        (10 << 2) + 1,
        (8 << 2) + 1,
        (6 << 2) + 0,
        (4 << 2) + 1,
        (2 << 2) + 1,
      ])

      expect(subset.straight).toBeUndefined()
    })

    test('should return subset when subset is a straight', () => {
      const subset = new Subset([
        (10 << 2) + 1,
        (9 << 2) + 1,
        (8 << 2) + 1,
        (7 << 2) + 1,
        (6 << 2) + 1,
      ])

      expect(subset.straight).toStrictEqual(
        new Subset([
          (10 << 2) + 1,
          (9 << 2) + 1,
          (8 << 2) + 1,
          (7 << 2) + 1,
          (6 << 2) + 1,
        ]),
      )
    })

    test('should return subset when subset is a straight with ace in the beginning', () => {
      const subset = new Subset([
        (12 << 2) + 1,
        (3 << 2) + 1,
        (2 << 2) + 0,
        (1 << 2) + 1,
        (0 << 2) + 1,
      ])

      expect(subset.straight).toStrictEqual(
        new Subset([
          (3 << 2) + 1,
          (2 << 2) + 0,
          (1 << 2) + 1,
          (0 << 2) + 1,
          (12 << 2) + 1,
        ]),
      )
    })
  })

  describe('#threeOfKind', () => {
    test('should return undefined when subset is not a three of a kind', () => {
      const subset = new Subset([
        (10 << 2) + 1,
        (8 << 2) + 1,
        (6 << 2) + 0,
        (4 << 2) + 1,
        (2 << 2) + 1,
      ])

      expect(subset.threeOfKind).toBeUndefined()
    })

    test('should return subset when subset is a three of a kind', () => {
      const subset = new Subset([
        (4 << 2) + 0,
        (2 << 2) + 0,
        (2 << 2) + 1,
        (2 << 2) + 2,
        (3 << 2) + 3,
      ])

      expect(subset.threeOfKind).toStrictEqual(
        new Subset([
          (2 << 2) + 0,
          (2 << 2) + 1,
          (2 << 2) + 2,
          (4 << 2) + 0,
          (3 << 2) + 3,
        ]),
      )
    })
  })

  describe('#twoPair', () => {
    test('should return undefined when subset is not a two pair', () => {
      const subset = new Subset([
        (10 << 2) + 1,
        (8 << 2) + 1,
        (6 << 2) + 0,
        (4 << 2) + 1,
        (2 << 2) + 1,
      ])

      expect(subset.twoPair).toBeUndefined()
    })

    test('should return subset when subset is a two pair', () => {
      const subset = new Subset([
        (4 << 2) + 0,
        (2 << 2) + 0,
        (2 << 2) + 1,
        (3 << 2) + 2,
        (3 << 2) + 3,
      ])

      expect(subset.twoPair).toStrictEqual(
        new Subset([
          (2 << 2) + 0,
          (2 << 2) + 1,
          (3 << 2) + 2,
          (3 << 2) + 3,
          (4 << 2) + 0,
        ]),
      )
    })
  })

  describe('#pair', () => {
    test('should return undefined when subset is not a pair', () => {
      const subset = new Subset([
        (10 << 2) + 1,
        (8 << 2) + 1,
        (6 << 2) + 0,
        (4 << 2) + 1,
        (2 << 2) + 1,
      ])

      expect(subset.pair).toBeUndefined()
    })

    test('should return subset when subset is a pair', () => {
      const subset = new Subset([
        (10 << 2) + 1,
        (4 << 2) + 1,
        (4 << 2) + 0,
        (3 << 2) + 2,
        (2 << 2) + 2,
      ])

      expect(subset.pair).toStrictEqual(
        new Subset([
          (4 << 2) + 1,
          (4 << 2) + 0,
          (10 << 2) + 1,
          (3 << 2) + 2,
          (2 << 2) + 2,
        ]),
      )
    })
  })

  describe('#getSubsets', () => {
    test('should accept 5 cards', () => {
      const subsets = Subset.getSubsets([1, 2, 3, 4, 5])

      expect(subsets).toStrictEqual([new Subset([1, 2, 3, 4, 5])])
    })

    test('should accept less than 5 cards', () => {
      const subsets = Subset.getSubsets([1, 2, 3, 4])

      expect(subsets).toStrictEqual([])
    })

    test('should accept 0 cards', () => {
      const subsets = Subset.getSubsets([])

      expect(subsets).toStrictEqual([])
    })

    test('should accept more than 5 cards', () => {
      const subsets = Subset.getSubsets([1, 2, 3, 4, 5, 6, 7])

      expect(subsets).toStrictEqual([
        new Subset([1, 2, 3, 4, 5]),
        new Subset([1, 2, 3, 4, 6]),
        new Subset([1, 2, 3, 4, 7]),
        new Subset([1, 2, 3, 5, 6]),
        new Subset([1, 2, 3, 5, 7]),
        new Subset([1, 2, 3, 6, 7]),
        new Subset([1, 2, 4, 5, 6]),
        new Subset([1, 2, 4, 5, 7]),
        new Subset([1, 2, 4, 6, 7]),
        new Subset([1, 2, 5, 6, 7]),
        new Subset([1, 3, 4, 5, 6]),
        new Subset([1, 3, 4, 5, 7]),
        new Subset([1, 3, 4, 6, 7]),
        new Subset([1, 3, 5, 6, 7]),
        new Subset([1, 4, 5, 6, 7]),
        new Subset([2, 3, 4, 5, 6]),
        new Subset([2, 3, 4, 5, 7]),
        new Subset([2, 3, 4, 6, 7]),
        new Subset([2, 3, 5, 6, 7]),
        new Subset([2, 4, 5, 6, 7]),
        new Subset([3, 4, 5, 6, 7]),
      ])
    })
  })
})
