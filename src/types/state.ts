export enum ROUND {
  PREFLOP = 'PREFLOP',
  FLOP = 'FLOP',
  TURN = 'TURN',
  RIVER = 'RIVER',
}

export type PlayerData = {
  id: string
  cards: number[]
  balance: number
  betAmount: number
  hasFolded: boolean
  hasLost: boolean
  hasTurned: boolean
}

export type RoomData = {
  id: string
  cards: number[]
  round: ROUND
  dealsCount: number
  dealerIndex: number
  currentPlayerIndex: number
  players: PlayerData[]
}

export interface RoomStorage {
  get(id: string): Promise<RoomData | undefined>
  set(id: string, room: RoomData): Promise<void>
  delete(id: string): Promise<void>
}
