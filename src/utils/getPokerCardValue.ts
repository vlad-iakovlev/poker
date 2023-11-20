import { POKER_CARD_VALUE } from '../types/card.js'

export const getPokerCardValue = (card: number): POKER_CARD_VALUE => {
  return card >> 2
}
