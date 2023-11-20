import { PokerSubset } from './PokerSubset.js'

describe('PokerSubset', () => {
  describe('#constructor', () => {
    it('should set cards', () => {
      const subset = new PokerSubset([1, 2, 3, 4, 5])

      expect(subset.cards).toStrictEqual([1, 2, 3, 4, 5])
    })
  })

  describe('#royalFlush', () => {
    it('should return undefined when subset is not starts with ace', () => {
      const subset = new PokerSubset([
        (10 << 2) + 1,
        (9 << 2) + 1,
        (8 << 2) + 1,
        (7 << 2) + 1,
        (6 << 2) + 1,
      ])

      expect(subset.royalFlush).toBeUndefined()
    })

    it('should return undefined when subset is starts with ace but not a flush', () => {
      const subset = new PokerSubset([
        (12 << 2) + 1,
        (11 << 2) + 1,
        (10 << 2) + 0,
        (9 << 2) + 1,
        (8 << 2) + 1,
      ])

      expect(subset.royalFlush).toBeUndefined()
    })

    it('should return undefined when subset is starts with ace and a flush but not a straight', () => {
      const subset = new PokerSubset([
        (12 << 2) + 1,
        (11 << 2) + 1,
        (10 << 2) + 1,
        (9 << 2) + 1,
        (7 << 2) + 1,
      ])

      expect(subset.royalFlush).toBeUndefined()
    })

    it('should return subset when subset is starts with ace and a flush and a strait', () => {
      const subset = new PokerSubset([
        (12 << 2) + 1,
        (11 << 2) + 1,
        (10 << 2) + 1,
        (9 << 2) + 1,
        (8 << 2) + 1,
      ])

      expect(subset.royalFlush).toStrictEqual(
        new PokerSubset([
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
    it('should return undefined when subset is not a flush', () => {
      const subset = new PokerSubset([
        (10 << 2) + 1,
        (8 << 2) + 1,
        (6 << 2) + 0,
        (4 << 2) + 1,
        (2 << 2) + 1,
      ])

      expect(subset.straightFlush).toBeUndefined()
    })

    it('should return undefined when subset is a flush but not a strait', () => {
      const subset = new PokerSubset([
        (10 << 2) + 1,
        (8 << 2) + 1,
        (6 << 2) + 1,
        (4 << 2) + 1,
        (2 << 2) + 1,
      ])

      expect(subset.straightFlush).toBeUndefined()
    })

    it('should return subset when subset is a flush and a strait', () => {
      const subset = new PokerSubset([
        (10 << 2) + 1,
        (9 << 2) + 1,
        (8 << 2) + 1,
        (7 << 2) + 1,
        (6 << 2) + 1,
      ])

      expect(subset.straightFlush).toStrictEqual(
        new PokerSubset([
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
    it('should return undefined when subset is not a four of a kind', () => {
      const subset = new PokerSubset([
        (10 << 2) + 1,
        (8 << 2) + 1,
        (6 << 2) + 0,
        (4 << 2) + 1,
        (2 << 2) + 1,
      ])

      expect(subset.fourOfKind).toBeUndefined()
    })

    it('should return subset when subset is a four of a kind', () => {
      const subset = new PokerSubset([
        (4 << 2) + 0,
        (2 << 2) + 0,
        (2 << 2) + 1,
        (2 << 2) + 2,
        (2 << 2) + 3,
      ])

      expect(subset.fourOfKind).toStrictEqual(
        new PokerSubset([
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
    it('should return undefined when subset is not a full house', () => {
      const subset = new PokerSubset([
        (10 << 2) + 1,
        (8 << 2) + 1,
        (6 << 2) + 0,
        (4 << 2) + 1,
        (2 << 2) + 1,
      ])

      expect(subset.fullHouse).toBeUndefined()
    })

    it('should return subset when subset is a full house #1', () => {
      const subset = new PokerSubset([
        (4 << 2) + 0,
        (4 << 2) + 1,
        (4 << 2) + 2,
        (2 << 2) + 2,
        (2 << 2) + 3,
      ])

      expect(subset.fullHouse).toStrictEqual(
        new PokerSubset([
          (4 << 2) + 0,
          (4 << 2) + 1,
          (4 << 2) + 2,
          (2 << 2) + 2,
          (2 << 2) + 3,
        ]),
      )
    })

    it('should return subset when subset is a full house #2', () => {
      const subset = new PokerSubset([
        (4 << 2) + 0,
        (4 << 2) + 1,
        (2 << 2) + 1,
        (2 << 2) + 2,
        (2 << 2) + 3,
      ])

      expect(subset.fullHouse).toStrictEqual(
        new PokerSubset([
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
    it('should return undefined when subset is not a flush', () => {
      const subset = new PokerSubset([
        (10 << 2) + 1,
        (8 << 2) + 1,
        (6 << 2) + 0,
        (4 << 2) + 1,
        (2 << 2) + 1,
      ])

      expect(subset.flush).toBeUndefined()
    })

    it('should return subset when subset is a flush', () => {
      const subset = new PokerSubset([
        (10 << 2) + 1,
        (8 << 2) + 1,
        (6 << 2) + 1,
        (4 << 2) + 1,
        (2 << 2) + 1,
      ])

      expect(subset.flush).toStrictEqual(
        new PokerSubset([
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
    it('should return undefined when subset is not a straight', () => {
      const subset = new PokerSubset([
        (10 << 2) + 1,
        (8 << 2) + 1,
        (6 << 2) + 0,
        (4 << 2) + 1,
        (2 << 2) + 1,
      ])

      expect(subset.straight).toBeUndefined()
    })

    it('should return subset when subset is a straight', () => {
      const subset = new PokerSubset([
        (10 << 2) + 1,
        (9 << 2) + 1,
        (8 << 2) + 1,
        (7 << 2) + 1,
        (6 << 2) + 1,
      ])

      expect(subset.straight).toStrictEqual(
        new PokerSubset([
          (10 << 2) + 1,
          (9 << 2) + 1,
          (8 << 2) + 1,
          (7 << 2) + 1,
          (6 << 2) + 1,
        ]),
      )
    })

    it('should return subset when subset is a straight with ace in the beginning', () => {
      const subset = new PokerSubset([
        (12 << 2) + 1,
        (3 << 2) + 1,
        (2 << 2) + 0,
        (1 << 2) + 1,
        (0 << 2) + 1,
      ])

      expect(subset.straight).toStrictEqual(
        new PokerSubset([
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
    it('should return undefined when subset is not a three of a kind', () => {
      const subset = new PokerSubset([
        (10 << 2) + 1,
        (8 << 2) + 1,
        (6 << 2) + 0,
        (4 << 2) + 1,
        (2 << 2) + 1,
      ])

      expect(subset.threeOfKind).toBeUndefined()
    })

    it('should return subset when subset is a three of a kind', () => {
      const subset = new PokerSubset([
        (4 << 2) + 0,
        (2 << 2) + 0,
        (2 << 2) + 1,
        (2 << 2) + 2,
        (3 << 2) + 3,
      ])

      expect(subset.threeOfKind).toStrictEqual(
        new PokerSubset([
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
    it('should return undefined when subset is not a two pair', () => {
      const subset = new PokerSubset([
        (10 << 2) + 1,
        (8 << 2) + 1,
        (6 << 2) + 0,
        (4 << 2) + 1,
        (2 << 2) + 1,
      ])

      expect(subset.twoPair).toBeUndefined()
    })

    it('should return subset when subset is a two pair', () => {
      const subset = new PokerSubset([
        (4 << 2) + 0,
        (2 << 2) + 0,
        (2 << 2) + 1,
        (3 << 2) + 2,
        (3 << 2) + 3,
      ])

      expect(subset.twoPair).toStrictEqual(
        new PokerSubset([
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
    it('should return undefined when subset is not a pair', () => {
      const subset = new PokerSubset([
        (10 << 2) + 1,
        (8 << 2) + 1,
        (6 << 2) + 0,
        (4 << 2) + 1,
        (2 << 2) + 1,
      ])

      expect(subset.pair).toBeUndefined()
    })

    it('should return subset when subset is a pair', () => {
      const subset = new PokerSubset([
        (10 << 2) + 1,
        (4 << 2) + 1,
        (4 << 2) + 0,
        (3 << 2) + 2,
        (2 << 2) + 2,
      ])

      expect(subset.pair).toStrictEqual(
        new PokerSubset([
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
    it('should accept 5 cards', () => {
      const subsets = PokerSubset.getSubsets([1, 2, 3, 4, 5])

      expect(subsets).toStrictEqual([new PokerSubset([1, 2, 3, 4, 5])])
    })

    it('should accept less than 5 cards', () => {
      const subsets = PokerSubset.getSubsets([1, 2, 3, 4])

      expect(subsets).toStrictEqual([])
    })

    it('should accept 0 cards', () => {
      const subsets = PokerSubset.getSubsets([])

      expect(subsets).toStrictEqual([])
    })

    it('should accept more than 5 cards', () => {
      const subsets = PokerSubset.getSubsets([1, 2, 3, 4, 5, 6, 7])

      expect(subsets).toStrictEqual([
        new PokerSubset([1, 2, 3, 4, 5]),
        new PokerSubset([1, 2, 3, 4, 6]),
        new PokerSubset([1, 2, 3, 4, 7]),
        new PokerSubset([1, 2, 3, 5, 6]),
        new PokerSubset([1, 2, 3, 5, 7]),
        new PokerSubset([1, 2, 3, 6, 7]),
        new PokerSubset([1, 2, 4, 5, 6]),
        new PokerSubset([1, 2, 4, 5, 7]),
        new PokerSubset([1, 2, 4, 6, 7]),
        new PokerSubset([1, 2, 5, 6, 7]),
        new PokerSubset([1, 3, 4, 5, 6]),
        new PokerSubset([1, 3, 4, 5, 7]),
        new PokerSubset([1, 3, 4, 6, 7]),
        new PokerSubset([1, 3, 5, 6, 7]),
        new PokerSubset([1, 4, 5, 6, 7]),
        new PokerSubset([2, 3, 4, 5, 6]),
        new PokerSubset([2, 3, 4, 5, 7]),
        new PokerSubset([2, 3, 4, 6, 7]),
        new PokerSubset([2, 3, 5, 6, 7]),
        new PokerSubset([2, 4, 5, 6, 7]),
        new PokerSubset([3, 4, 5, 6, 7]),
      ])
    })
  })
})
