import { PlayerData } from '../types/state.js'
import { Combination } from './Combination.js'
import { Room } from './Room.js'

export type PlayerParams = {
  id: string
  room: Room
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Player<Payload = any> {
  room: Room

  id: string
  cards: number[]
  balance: number
  betAmount: number
  hasFolded: boolean
  hasLost: boolean
  hasTurned: boolean
  payload: Payload

  constructor(room: Room, playerData: PlayerData<Payload>) {
    this.room = room

    this.id = playerData.id
    this.cards = playerData.cards
    this.balance = playerData.balance
    this.betAmount = playerData.betAmount
    this.hasFolded = playerData.hasFolded
    this.hasLost = playerData.hasLost
    this.hasTurned = playerData.hasTurned
    this.payload = playerData.payload
  }

  // TODO: memoize
  get bestCombination(): Combination | undefined {
    return Combination.getBest([...this.room.cards, ...this.cards])
  }

  get callAmount(): number {
    return this.room.requiredBetAmount - this.betAmount
  }

  get minRaiseAmount(): number {
    return this.room.baseBetAmount
  }

  get maxRaiseAmount(): number {
    return this.balance - this.callAmount
  }

  get canFold(): boolean {
    return !this.hasLost && !this.hasFolded && !!this.balance
  }

  get canCheck(): boolean {
    return (
      !this.hasLost && !this.hasFolded && !!this.balance && !this.callAmount
    )
  }

  get canCall(): boolean {
    return !this.hasLost && !this.hasFolded && this.callAmount <= this.balance
  }

  get canRaise(): boolean {
    return (
      !this.hasLost &&
      !this.hasFolded &&
      this.minRaiseAmount <= this.maxRaiseAmount
    )
  }

  get canAllIn(): boolean {
    return !this.hasLost && !this.hasFolded && !!this.balance
  }

  increaseBet(amount: number) {
    amount = Math.min(amount, this.balance)
    this.betAmount += amount
    this.balance -= amount
  }
}
