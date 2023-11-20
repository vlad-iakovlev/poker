import { CARD_VALUE } from '../types/card.js'

export const getCardValue = (card: number): CARD_VALUE => {
  return card >> 2
}
