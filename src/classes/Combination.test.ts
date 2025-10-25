import { describe, expect, test } from 'vitest'
import { COMBINATION_LEVEL } from '../types/card.js'
import { Combination } from './Combination.js'
import { Subset } from './Subset.js'

describe('Combination', () => {
  describe('#constructor', () => {
    test('should set level and subset', () => {
      const level = COMBINATION_LEVEL.PAIR
      const subset = new Subset([1, 2, 3, 4, 5])

      const combination = new Combination(level, subset)

      expect(combination.level).toBe(level)
      expect(combination.subset).toBe(subset)
    })
  })

  describe('#weight', () => {
    test('should return weight', () => {
      const level = COMBINATION_LEVEL.PAIR
      const subset = new Subset([1, 2, 3, 4, 5])

      const combination = new Combination(level, subset)

      expect(combination.weight).toBe(10000000101)
    })
  })

  describe('#getBest', () => {
    test('should return royal flash combination', () => {
      const cards = [
        (11 << 2) + 0,
        (8 << 2) + 1,
        (12 << 2) + 0,
        (8 << 2) + 0,
        (10 << 2) + 0,
        (3 << 2) + 0,
        (9 << 2) + 0,
      ]

      const combination = Combination.getBest(cards)

      expect(combination).toStrictEqual(
        new Combination(
          COMBINATION_LEVEL.ROYAL_FLUSH,
          new Subset([
            (12 << 2) + 0,
            (11 << 2) + 0,
            (10 << 2) + 0,
            (9 << 2) + 0,
            (8 << 2) + 0,
          ]),
        ),
      )
    })

    test('should return straight flash combination', () => {
      const cards = [
        (11 << 2) + 0,
        (8 << 2) + 1,
        (7 << 2) + 0,
        (8 << 2) + 0,
        (10 << 2) + 0,
        (3 << 2) + 0,
        (9 << 2) + 0,
      ]

      const combination = Combination.getBest(cards)

      expect(combination).toStrictEqual(
        new Combination(
          COMBINATION_LEVEL.STRAIGHT_FLUSH,
          new Subset([
            (11 << 2) + 0,
            (10 << 2) + 0,
            (9 << 2) + 0,
            (8 << 2) + 0,
            (7 << 2) + 0,
          ]),
        ),
      )
    })

    test('should return four of a kind combination', () => {
      const cards = [
        (11 << 2) + 0,
        (8 << 2) + 1,
        (8 << 2) + 3,
        (8 << 2) + 0,
        (8 << 2) + 2,
        (3 << 2) + 0,
        (9 << 2) + 0,
      ]

      const combination = Combination.getBest(cards)

      expect(combination).toStrictEqual(
        new Combination(
          COMBINATION_LEVEL.FOUR_OF_KIND,
          new Subset([
            (8 << 2) + 3,
            (8 << 2) + 2,
            (8 << 2) + 1,
            (8 << 2) + 0,
            (11 << 2) + 0,
          ]),
        ),
      )
    })

    test('should return full house combination', () => {
      const cards = [
        (11 << 2) + 0,
        (8 << 2) + 1,
        (9 << 2) + 3,
        (9 << 2) + 0,
        (8 << 2) + 2,
        (3 << 2) + 0,
        (9 << 2) + 2,
      ]

      const combination = Combination.getBest(cards)

      expect(combination).toStrictEqual(
        new Combination(
          COMBINATION_LEVEL.FULL_HOUSE,
          new Subset([
            (9 << 2) + 3,
            (9 << 2) + 2,
            (9 << 2) + 0,
            (8 << 2) + 2,
            (8 << 2) + 1,
          ]),
        ),
      )
    })

    test('should return flush combination', () => {
      const cards = [
        (11 << 2) + 0,
        (8 << 2) + 1,
        (12 << 2) + 2,
        (8 << 2) + 0,
        (10 << 2) + 0,
        (3 << 2) + 0,
        (9 << 2) + 0,
      ]

      const combination = Combination.getBest(cards)

      expect(combination).toStrictEqual(
        new Combination(
          COMBINATION_LEVEL.FLUSH,
          new Subset([
            (11 << 2) + 0,
            (10 << 2) + 0,
            (9 << 2) + 0,
            (8 << 2) + 0,
            (3 << 2) + 0,
          ]),
        ),
      )
    })

    test('should return straight combination', () => {
      const cards = [
        (11 << 2) + 0,
        (8 << 2) + 1,
        (7 << 2) + 0,
        (8 << 2) + 2,
        (10 << 2) + 0,
        (3 << 2) + 0,
        (9 << 2) + 3,
      ]

      const combination = Combination.getBest(cards)

      expect(combination).toStrictEqual(
        new Combination(
          COMBINATION_LEVEL.STRAIGHT,
          new Subset([
            (11 << 2) + 0,
            (10 << 2) + 0,
            (9 << 2) + 3,
            (8 << 2) + 1,
            (7 << 2) + 0,
          ]),
        ),
      )
    })

    test('should return three of a kind combination', () => {
      const cards = [
        (11 << 2) + 0,
        (8 << 2) + 1,
        (9 << 2) + 3,
        (9 << 2) + 0,
        (10 << 2) + 2,
        (3 << 2) + 0,
        (9 << 2) + 2,
      ]

      const combination = Combination.getBest(cards)

      expect(combination).toStrictEqual(
        new Combination(
          COMBINATION_LEVEL.THREE_OF_KIND,
          new Subset([
            (9 << 2) + 3,
            (9 << 2) + 2,
            (9 << 2) + 0,
            (11 << 2) + 0,
            (10 << 2) + 2,
          ]),
        ),
      )
    })

    test('should return two pair combination', () => {
      const cards = [
        (11 << 2) + 0,
        (8 << 2) + 1,
        (9 << 2) + 3,
        (9 << 2) + 0,
        (8 << 2) + 2,
        (3 << 2) + 0,
        (10 << 2) + 0,
      ]

      const combination = Combination.getBest(cards)

      expect(combination).toStrictEqual(
        new Combination(
          COMBINATION_LEVEL.TWO_PAIR,
          new Subset([
            (9 << 2) + 3,
            (9 << 2) + 0,
            (8 << 2) + 2,
            (8 << 2) + 1,
            (11 << 2) + 0,
          ]),
        ),
      )
    })

    test('should return pair combination', () => {
      const cards = [
        (11 << 2) + 0,
        (8 << 2) + 1,
        (5 << 2) + 3,
        (9 << 2) + 0,
        (8 << 2) + 2,
        (3 << 2) + 0,
        (10 << 2) + 2,
      ]

      const combination = Combination.getBest(cards)

      expect(combination).toStrictEqual(
        new Combination(
          COMBINATION_LEVEL.PAIR,
          new Subset([
            (8 << 2) + 2,
            (8 << 2) + 1,
            (11 << 2) + 0,
            (10 << 2) + 2,
            (9 << 2) + 0,
          ]),
        ),
      )
    })

    test('should return high card combination', () => {
      const cards = [
        (11 << 2) + 0,
        (8 << 2) + 1,
        (5 << 2) + 3,
        (9 << 2) + 0,
        (2 << 2) + 2,
        (3 << 2) + 0,
        (10 << 2) + 2,
      ]

      const combination = Combination.getBest(cards)

      expect(combination).toStrictEqual(
        new Combination(
          COMBINATION_LEVEL.HIGH_CARD,
          new Subset([
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
