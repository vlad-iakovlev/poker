import { getPokerCardSuit } from './getPokerCardSuit.js'

export const isPokerCardSuitEqual = (card1: number, card2: number): boolean => {
  return getPokerCardSuit(card1) === getPokerCardSuit(card2)
}
