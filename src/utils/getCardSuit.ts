import { CARD_SUIT } from '../types/card.js'

export const getCardSuit = (card: number): CARD_SUIT => {
  return card % 4
}
