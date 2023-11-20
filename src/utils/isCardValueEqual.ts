import { getCardValue } from './getCardValue.js'

export const isCardValueEqual = (card1: number, card2: number): boolean => {
  return getCardValue(card1) === getCardValue(card2)
}
