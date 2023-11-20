import * as R from 'remeda'
import { CARD_VALUE } from '../types/card.js'
import { getCardValue } from '../utils/getCardValue.js'
import { isCardSuitEqual } from '../utils/isCardSuitEqual.js'
import { isCardValueEqual } from '../utils/isCardValueEqual.js'

export class Subset {
  cards: [number, number, number, number, number]

  constructor(cards: Subset['cards']) {
    this.cards = cards
  }

  get royalFlush(): Subset | undefined {
    if (getCardValue(this.cards[0]) === CARD_VALUE.ACE) {
      return this.straightFlush
    }
  }

  get straightFlush(): Subset | undefined {
    return this.straight?.flush
  }

  get fourOfKind(): Subset | undefined {
    for (let i = 0; i < this.cards.length - 3; i += 1) {
      for (let j = i + 1; j < this.cards.length - 2; j += 1) {
        for (let k = j + 1; k < this.cards.length - 1; k += 1) {
          for (let l = k + 1; l < this.cards.length; l += 1) {
            if (
              isCardValueEqual(this.cards[i], this.cards[j]) &&
              isCardValueEqual(this.cards[i], this.cards[k]) &&
              isCardValueEqual(this.cards[i], this.cards[l])
            ) {
              return this.reorder([i, j, k, l])
            }
          }
        }
      }
    }
  }

  get fullHouse(): Subset | undefined {
    if (
      isCardValueEqual(this.cards[0], this.cards[1]) &&
      isCardValueEqual(this.cards[0], this.cards[2]) &&
      isCardValueEqual(this.cards[3], this.cards[4])
    ) {
      return this
    }

    if (
      isCardValueEqual(this.cards[2], this.cards[3]) &&
      isCardValueEqual(this.cards[2], this.cards[4]) &&
      isCardValueEqual(this.cards[0], this.cards[1])
    ) {
      return this.reorder([2, 3, 4])
    }
  }

  get flush(): this | undefined {
    if (
      isCardSuitEqual(this.cards[0], this.cards[1]) &&
      isCardSuitEqual(this.cards[0], this.cards[2]) &&
      isCardSuitEqual(this.cards[0], this.cards[3]) &&
      isCardSuitEqual(this.cards[0], this.cards[4])
    ) {
      return this
    }
  }

  get straight(): Subset | undefined {
    if (
      getCardValue(this.cards[0]) === CARD_VALUE.ACE &&
      getCardValue(this.cards[1]) === CARD_VALUE.FIVE &&
      getCardValue(this.cards[2]) === CARD_VALUE.FOUR &&
      getCardValue(this.cards[3]) === CARD_VALUE.THREE &&
      getCardValue(this.cards[4]) === CARD_VALUE.TWO
    ) {
      return this.reorder([1, 2, 3, 4])
    }

    if (
      isCardValueEqual(this.cards[0], this.cards[1] + 4) &&
      isCardValueEqual(this.cards[1], this.cards[2] + 4) &&
      isCardValueEqual(this.cards[2], this.cards[3] + 4) &&
      isCardValueEqual(this.cards[3], this.cards[4] + 4)
    ) {
      return this
    }
  }

  get threeOfKind(): Subset | undefined {
    for (let i = 0; i < this.cards.length - 2; i += 1) {
      for (let j = i + 1; j < this.cards.length - 1; j += 1) {
        for (let k = j + 1; k < this.cards.length; k += 1) {
          if (
            isCardValueEqual(this.cards[i], this.cards[j]) &&
            isCardValueEqual(this.cards[i], this.cards[k])
          ) {
            return this.reorder([i, j, k])
          }
        }
      }
    }
  }

  get twoPair(): Subset | undefined {
    for (let i = 0; i < this.cards.length - 3; i += 1) {
      for (let j = i + 1; j < this.cards.length - 2; j += 1) {
        for (let k = j + 1; k < this.cards.length - 1; k += 1) {
          for (let l = k + 1; l < this.cards.length; l += 1) {
            if (
              isCardValueEqual(this.cards[i], this.cards[j]) &&
              isCardValueEqual(this.cards[k], this.cards[l])
            ) {
              return this.reorder([i, j, k, l])
            }
          }
        }
      }
    }
  }

  get pair(): Subset | undefined {
    for (let i = 0; i < this.cards.length - 1; i += 1) {
      for (let j = i + 1; j < this.cards.length; j += 1) {
        if (isCardValueEqual(this.cards[i], this.cards[j])) {
          return this.reorder([i, j])
        }
      }
    }
  }

  static getSubsets(this: void, cards: number[]): Subset[] {
    const subsets: Subset[] = []

    for (let i = 0; i < cards.length - 4; i += 1) {
      for (let j = i + 1; j < cards.length - 3; j += 1) {
        for (let k = j + 1; k < cards.length - 2; k += 1) {
          for (let l = k + 1; l < cards.length - 1; l += 1) {
            for (let m = l + 1; m < cards.length; m += 1) {
              subsets.push(
                new Subset([cards[i], cards[j], cards[k], cards[l], cards[m]]),
              )
            }
          }
        }
      }
    }

    return subsets
  }

  private reorder(priorityIndexes: number[]): Subset {
    const newSubset = new Subset(
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
