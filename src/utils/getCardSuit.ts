import { CARD_SUIT } from '../types/card.js'

// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment
export const getCardSuit = (card: number): CARD_SUIT => card % 4
