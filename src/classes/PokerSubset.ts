import * as R from 'remeda'
import { POKER_CARD_VALUE } from '../types/card.js'
import { getPokerCardValue } from '../utils/getPokerCardValue.js'
import { isPokerCardSuitEqual } from '../utils/isPokerCardSuitEqual.js'
import { isPokerCardValueEqual } from '../utils/isPokerCardValueEqual.js'

export class PokerSubset {
  cards: [number, number, number, number, number]

  constructor(cards: PokerSubset['cards']) {
    this.cards = cards
  }

  get royalFlush(): PokerSubset | undefined {
    if (getPokerCardValue(this.cards[0]) === POKER_CARD_VALUE.ACE) {
      return this.straightFlush
    }
  }

  get straightFlush(): PokerSubset | undefined {
    return this.straight?.flush
  }

  get fourOfKind(): PokerSubset | undefined {
    for (let i = 0; i < this.cards.length - 3; i += 1) {
      for (let j = i + 1; j < this.cards.length - 2; j += 1) {
        for (let k = j + 1; k < this.cards.length - 1; k += 1) {
          for (let l = k + 1; l < this.cards.length; l += 1) {
            if (
              isPokerCardValueEqual(this.cards[i], this.cards[j]) &&
              isPokerCardValueEqual(this.cards[i], this.cards[k]) &&
              isPokerCardValueEqual(this.cards[i], this.cards[l])
            ) {
              return this.reorder([i, j, k, l])
            }
          }
        }
      }
    }
  }

  get fullHouse(): PokerSubset | undefined {
    if (
      isPokerCardValueEqual(this.cards[0], this.cards[1]) &&
      isPokerCardValueEqual(this.cards[0], this.cards[2]) &&
      isPokerCardValueEqual(this.cards[3], this.cards[4])
    ) {
      return this
    }

    if (
      isPokerCardValueEqual(this.cards[2], this.cards[3]) &&
      isPokerCardValueEqual(this.cards[2], this.cards[4]) &&
      isPokerCardValueEqual(this.cards[0], this.cards[1])
    ) {
      return this.reorder([2, 3, 4])
    }
  }

  get flush(): this | undefined {
    if (
      isPokerCardSuitEqual(this.cards[0], this.cards[1]) &&
      isPokerCardSuitEqual(this.cards[0], this.cards[2]) &&
      isPokerCardSuitEqual(this.cards[0], this.cards[3]) &&
      isPokerCardSuitEqual(this.cards[0], this.cards[4])
    ) {
      return this
    }
  }

  get straight(): PokerSubset | undefined {
    if (
      getPokerCardValue(this.cards[0]) === POKER_CARD_VALUE.ACE &&
      getPokerCardValue(this.cards[1]) === POKER_CARD_VALUE.FIVE &&
      getPokerCardValue(this.cards[2]) === POKER_CARD_VALUE.FOUR &&
      getPokerCardValue(this.cards[3]) === POKER_CARD_VALUE.THREE &&
      getPokerCardValue(this.cards[4]) === POKER_CARD_VALUE.TWO
    ) {
      return this.reorder([1, 2, 3, 4])
    }

    if (
      isPokerCardValueEqual(this.cards[0], this.cards[1] + 4) &&
      isPokerCardValueEqual(this.cards[1], this.cards[2] + 4) &&
      isPokerCardValueEqual(this.cards[2], this.cards[3] + 4) &&
      isPokerCardValueEqual(this.cards[3], this.cards[4] + 4)
    ) {
      return this
    }
  }

  get threeOfKind(): PokerSubset | undefined {
    for (let i = 0; i < this.cards.length - 2; i += 1) {
      for (let j = i + 1; j < this.cards.length - 1; j += 1) {
        for (let k = j + 1; k < this.cards.length; k += 1) {
          if (
            isPokerCardValueEqual(this.cards[i], this.cards[j]) &&
            isPokerCardValueEqual(this.cards[i], this.cards[k])
          ) {
            return this.reorder([i, j, k])
          }
        }
      }
    }
  }

  get twoPair(): PokerSubset | undefined {
    for (let i = 0; i < this.cards.length - 3; i += 1) {
      for (let j = i + 1; j < this.cards.length - 2; j += 1) {
        for (let k = j + 1; k < this.cards.length - 1; k += 1) {
          for (let l = k + 1; l < this.cards.length; l += 1) {
            if (
              isPokerCardValueEqual(this.cards[i], this.cards[j]) &&
              isPokerCardValueEqual(this.cards[k], this.cards[l])
            ) {
              return this.reorder([i, j, k, l])
            }
          }
        }
      }
    }
  }

  get pair(): PokerSubset | undefined {
    for (let i = 0; i < this.cards.length - 1; i += 1) {
      for (let j = i + 1; j < this.cards.length; j += 1) {
        if (isPokerCardValueEqual(this.cards[i], this.cards[j])) {
          return this.reorder([i, j])
        }
      }
    }
  }

  static getSubsets(this: void, cards: number[]): PokerSubset[] {
    const subsets: PokerSubset[] = []

    for (let i = 0; i < cards.length - 4; i += 1) {
      for (let j = i + 1; j < cards.length - 3; j += 1) {
        for (let k = j + 1; k < cards.length - 2; k += 1) {
          for (let l = k + 1; l < cards.length - 1; l += 1) {
            for (let m = l + 1; m < cards.length; m += 1) {
              subsets.push(
                new PokerSubset([
                  cards[i],
                  cards[j],
                  cards[k],
                  cards[l],
                  cards[m],
                ]),
              )
            }
          }
        }
      }
    }

    return subsets
  }

  private reorder(priorityIndexes: number[]): PokerSubset {
    const newSubset = new PokerSubset(
      [] as unknown as [number, number, number, number, number],
    )
    const otherIndexes = new Set(R.range(0, this.cards.length))

    priorityIndexes.forEach((index) => {
      newSubset.cards.push(this.cards[index])
      otherIndexes.delete(index)
    })

    otherIndexes.forEach((index) => {
      newSubset.cards.push(this.cards[index])
    })

    return newSubset
  }
}
