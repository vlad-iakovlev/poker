export enum POKER_ROUND {
  PREFLOP = 'PREFLOP',
  FLOP = 'FLOP',
  TURN = 'TURN',
  RIVER = 'RIVER',
}

export type PokerPlayer = {
  id: string
  userId: string
  cards: number[]
  balance: number
  betAmount: number
  hasFolded: boolean
  hasLost: boolean
  hasTurned: boolean
}

export type PokerState = {
  id: string
  roomId: string
  cards: number[]
  round: POKER_ROUND
  dealsCount: number
  dealerIndex: number
  currentPlayerIndex: number
  players: PokerPlayer[]
}

export interface PokerStateStorage {
  upsertRoom(params: {
    where: {
      roomId: string
    }
    create: Omit<PokerState, 'id'>
    update: Partial<PokerState>
  }): Promise<PokerState>

  updateRoom(params: {
    where: {
      id: string
    }
    data: Omit<PokerState, 'id' | 'roomId'>
  }): Promise<void>

  deleteRoom(params: {
    where: {
      id: string
    }
  }): Promise<void>

  createPlayer(params: { data: Omit<PokerPlayer, 'id'> }): Promise<PokerPlayer>
}
