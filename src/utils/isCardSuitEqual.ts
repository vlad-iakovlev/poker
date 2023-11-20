import { getCardSuit } from './getCardSuit.js'

export const isCardSuitEqual = (card1: number, card2: number): boolean => {
  return getCardSuit(card1) === getCardSuit(card2)
}
