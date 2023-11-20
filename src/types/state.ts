export enum ROUND {
  PREFLOP = 'PREFLOP',
  FLOP = 'FLOP',
  TURN = 'TURN',
  RIVER = 'RIVER',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PlayerData<Payload = any> = {
  id: string
  cards: number[]
  balance: number
  betAmount: number
  hasFolded: boolean
  hasLost: boolean
  hasTurned: boolean
  payload: Payload
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RoomData<RoomPayload = any, PlayerPayload = any> = {
  id: string
  cards: number[]
  round: ROUND
  dealsCount: number
  dealerIndex: number
  currentPlayerIndex: number
  players: PlayerData<PlayerPayload>[]
  payload: RoomPayload
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface RoomStorage<RoomPayload = any, PlayerPayload = any> {
  get(id: string): Promise<RoomData<RoomPayload, PlayerPayload> | undefined>
  set(id: string, roomData: RoomData<RoomPayload, PlayerPayload>): Promise<void>
  delete(id: string): Promise<void>
}
