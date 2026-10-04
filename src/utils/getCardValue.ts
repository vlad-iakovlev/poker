import { CARD_VALUE } from '../types/card.js'

// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment
export const getCardValue = (card: number): CARD_VALUE => card >> 2
