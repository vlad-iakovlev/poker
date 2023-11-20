import { POKER_CARD_SUIT } from '../types/card.js'

export const getPokerCardSuit = (card: number): POKER_CARD_SUIT => {
  return card % 4
}
