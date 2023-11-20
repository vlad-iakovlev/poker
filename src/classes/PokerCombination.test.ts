import { POKER_COMBINATION_LEVEL } from '../types/card.js'
import { PokerCombination } from './PokerCombination.js'
import { PokerSubset } from './PokerSubset.js'

describe('PokerCombination', () => {
  describe('#constructor', () => {
    it('should set level and subset', () => {
      const level = POKER_COMBINATION_LEVEL.PAIR
      const subset = new PokerSubset([1, 2, 3, 4, 5])

      const combination = new PokerCombination(level, subset)

      expect(combination.level).toBe(level)
      expect(combination.subset).toBe(subset)
    })
  })

  describe('#weight', () => {
    it('should return weight', () => {
      const level = POKER_COMBINATION_LEVEL.PAIR
      const subset = new PokerSubset([1, 2, 3, 4, 5])

      const combination = new PokerCombination(level, subset)

      expect(combination.weight).toBe(10000000101)
    })
  })

  describe('#getBest', () => {
    it('should return royal flash combination', () => {
      const cards = [
        (11 << 2) + 0,
        (8 << 2) + 1,
        (12 << 2) + 0,
        (8 << 2) + 0,
        (10 << 2) + 0,
        (3 << 2) + 0,
        (9 << 2) + 0,
      ]

      const combination = PokerCombination.getBest(cards)

      expect(combination).toStrictEqual(
        new PokerCombination(
          POKER_COMBINATION_LEVEL.ROYAL_FLUSH,
          new PokerSubset([
            (12 << 2) + 0,
            (11 << 2) + 0,
            (10 << 2) + 0,
            (9 << 2) + 0,
            (8 << 2) + 0,
          ]),
        ),
      )
    })

    it('should return straight flash combination', () => {
      const cards = [
        (11 << 2) + 0,
        (8 << 2) + 1,
        (7 << 2) + 0,
        (8 << 2) + 0,
        (10 << 2) + 0,
        (3 << 2) + 0,
        (9 << 2) + 0,
      ]

      const combination = PokerCombination.getBest(cards)

      expect(combination).toStrictEqual(
        new PokerCombination(
          POKER_COMBINATION_LEVEL.STRAIGHT_FLUSH,
          new PokerSubset([
            (11 << 2) + 0,
            (10 << 2) + 0,
            (9 << 2) + 0,
            (8 << 2) + 0,
            (7 << 2) + 0,
          ]),
        ),
      )
    })

    it('should return four of a kind combination', () => {
      const cards = [
        (11 << 2) + 0,
        (8 << 2) + 1,
        (8 << 2) + 3,
        (8 << 2) + 0,
        (8 << 2) + 2,
        (3 << 2) + 0,
        (9 << 2) + 0,
      ]

      const combination = PokerCombination.getBest(cards)

      expect(combination).toStrictEqual(
        new PokerCombination(
          POKER_COMBINATION_LEVEL.FOUR_OF_KIND,
          new PokerSubset([
            (8 << 2) + 3,
            (8 << 2) + 2,
            (8 << 2) + 1,
            (8 << 2) + 0,
            (11 << 2) + 0,
          ]),
        ),
      )
    })

    it('should return full house combination', () => {
      const cards = [
        (11 << 2) + 0,
        (8 << 2) + 1,
        (9 << 2) + 3,
        (9 << 2) + 0,
        (8 << 2) + 2,
        (3 << 2) + 0,
        (9 << 2) + 2,
      ]

      const combination = PokerCombination.getBest(cards)

      expect(combination).toStrictEqual(
        new PokerCombination(
          POKER_COMBINATION_LEVEL.FULL_HOUSE,
          new PokerSubset([
            (9 << 2) + 3,
            (9 << 2) + 2,
            (9 << 2) + 0,
            (8 << 2) + 2,
            (8 << 2) + 1,
          ]),
        ),
      )
    })

    it('should return flush combination', () => {
      const cards = [
        (11 << 2) + 0,
        (8 << 2) + 1,
        (12 << 2) + 2,
        (8 << 2) + 0,
        (10 << 2) + 0,
        (3 << 2) + 0,
        (9 << 2) + 0,
      ]

      const combination = PokerCombination.getBest(cards)

      expect(combination).toStrictEqual(
        new PokerCombination(
          POKER_COMBINATION_LEVEL.FLUSH,
          new PokerSubset([
            (11 << 2) + 0,
            (10 << 2) + 0,
            (9 << 2) + 0,
            (8 << 2) + 0,
            (3 << 2) + 0,
          ]),
        ),
      )
    })

    it('should return straight combination', () => {
      const cards = [
        (11 << 2) + 0,
        (8 << 2) + 1,
        (7 << 2) + 0,
        (8 << 2) + 2,
        (10 << 2) + 0,
        (3 << 2) + 0,
        (9 << 2) + 3,
      ]

      const combination = PokerCombination.getBest(cards)

      expect(combination).toStrictEqual(
        new PokerCombination(
          POKER_COMBINATION_LEVEL.STRAIGHT,
          new PokerSubset([
            (11 << 2) + 0,
            (10 << 2) + 0,
            (9 << 2) + 3,
            (8 << 2) + 1,
            (7 << 2) + 0,
          ]),
        ),
      )
    })

    it('should return three of a kind combination', () => {
      const cards = [
        (11 << 2) + 0,
        (8 << 2) + 1,
        (9 << 2) + 3,
        (9 << 2) + 0,
        (10 << 2) + 2,
        (3 << 2) + 0,
        (9 << 2) + 2,
      ]

      const combination = PokerCombination.getBest(cards)

      expect(combination).toStrictEqual(
        new PokerCombination(
          POKER_COMBINATION_LEVEL.THREE_OF_KIND,
          new PokerSubset([
            (9 << 2) + 3,
            (9 << 2) + 2,
            (9 << 2) + 0,
            (11 << 2) + 0,
            (10 << 2) + 2,
          ]),
        ),
      )
    })

    it('should return two pair combination', () => {
      const cards = [
        (11 << 2) + 0,
        (8 << 2) + 1,
        (9 << 2) + 3,
        (9 << 2) + 0,
        (8 << 2) + 2,
        (3 << 2) + 0,
        (10 << 2) + 0,
      ]

      const combination = PokerCombination.getBest(cards)

      expect(combination).toStrictEqual(
        new PokerCombination(
          POKER_COMBINATION_LEVEL.TWO_PAIR,
          new PokerSubset([
            (9 << 2) + 3,
            (9 << 2) + 0,
            (8 << 2) + 2,
            (8 << 2) + 1,
            (11 << 2) + 0,
          ]),
        ),
      )
    })

    it('should return pair combination', () => {
      const cards = [
        (11 << 2) + 0,
        (8 << 2) + 1,
        (5 << 2) + 3,
        (9 << 2) + 0,
        (8 << 2) + 2,
        (3 << 2) + 0,
        (10 << 2) + 2,
      ]

      const combination = PokerCombination.getBest(cards)

      expect(combination).toStrictEqual(
        new PokerCombination(
          POKER_COMBINATION_LEVEL.PAIR,
          new PokerSubset([
            (8 << 2) + 2,
            (8 << 2) + 1,
            (11 << 2) + 0,
            (10 << 2) + 2,
            (9 << 2) + 0,
          ]),
        ),
      )
    })

    it('should return high card combination', () => {
      const cards = [
        (11 << 2) + 0,
        (8 << 2) + 1,
        (5 << 2) + 3,
        (9 << 2) + 0,
        (2 << 2) + 2,
        (3 << 2) + 0,
        (10 << 2) + 2,
      ]

      const combination = PokerCombination.getBest(cards)

      expect(combination).toStrictEqual(
        new PokerCombination(
          POKER_COMBINATION_LEVEL.HIGH_CARD,
          new PokerSubset([
            (11 << 2) + 0,
            (10 << 2) + 2,
            (9 << 2) + 0,
            (8 << 2) + 1,
            (5 << 2) + 3,
          ]),
        ),
      )
    })
  })
})
