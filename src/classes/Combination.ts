import * as R from 'remeda'
import { COMBINATION_LEVEL } from '../types/card.js'
import { getCardValue } from '../utils/getCardValue.js'
import { Subset } from './Subset.js'

export class Combination {
  level: COMBINATION_LEVEL
  subset: Subset

  constructor(level: COMBINATION_LEVEL, subset: Subset) {
    this.level = level
    this.subset = subset
  }

  /**
   * Weight of combination. Used for comparing combinations
   */
  get weight() {
    return (
      this.level * 1e10 +
      getCardValue(this.subset.cards[0]) * 1e8 +
      getCardValue(this.subset.cards[1]) * 1e6 +
      getCardValue(this.subset.cards[2]) * 1e4 +
      getCardValue(this.subset.cards[3]) * 1e2 +
      getCardValue(this.subset.cards[4])
    )
  }

  /**
   * Get best combination from given cards
   */
  static getBest(cards: number[]): Combination | undefined {
    return R.pipe(
      cards,
      R.sort((a, b) => b - a),
      Subset.getSubsets,
      R.map(
        (subset) =>
          // prettier-ignore
          Combination.build(COMBINATION_LEVEL.ROYAL_FLUSH, subset.royalFlush) ??
          Combination.build(COMBINATION_LEVEL.STRAIGHT_FLUSH, subset.straightFlush) ??
          Combination.build(COMBINATION_LEVEL.FOUR_OF_KIND, subset.fourOfKind) ??
          Combination.build(COMBINATION_LEVEL.FULL_HOUSE, subset.fullHouse) ??
          Combination.build(COMBINATION_LEVEL.FLUSH, subset.flush) ??
          Combination.build(COMBINATION_LEVEL.STRAIGHT, subset.straight) ??
          Combination.build(COMBINATION_LEVEL.THREE_OF_KIND, subset.threeOfKind) ??
          Combination.build(COMBINATION_LEVEL.TWO_PAIR, subset.twoPair) ??
          Combination.build(COMBINATION_LEVEL.PAIR, subset.pair) ??
          Combination.build(COMBINATION_LEVEL.HIGH_CARD, subset),
      ),
      R.sort((a, b) => a.weight - b.weight),
      R.last(),
    )
  }

  private static build(
    this: void,
    level: COMBINATION_LEVEL,
    subset: Subset,
  ): Combination

  private static build(
    this: void,
    level: COMBINATION_LEVEL,
    subset?: Subset,
  ): Combination | undefined

  private static build(
    this: void,
    level: COMBINATION_LEVEL,
    subset?: Subset,
  ): Combination | undefined {
    if (subset) {
      return new Combination(level, subset)
    }
  }
}
