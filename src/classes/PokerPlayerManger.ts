import { PokerPlayer } from '../types/state.js'
import { PokerCombination } from './PokerCombination.js'
import { PokerStateManager } from './PokerStateManager.js'

export class PokerPlayerManager {
  pokerStateManager: PokerStateManager

  id: string
  userId: string
  cards: number[]
  balance: number
  betAmount: number
  hasFolded: boolean
  hasLost: boolean
  hasTurned: boolean

  constructor(pokerStateManager: PokerStateManager, playerData: PokerPlayer) {
    this.pokerStateManager = pokerStateManager

    this.id = playerData.id
    this.userId = playerData.userId
    this.cards = playerData.cards
    this.balance = playerData.balance
    this.betAmount = playerData.betAmount
    this.hasFolded = playerData.hasFolded
    this.hasLost = playerData.hasLost
    this.hasTurned = playerData.hasTurned
  }

  // TODO: memoize
  get bestCombination(): PokerCombination | undefined {
    return PokerCombination.getBest([
      ...this.pokerStateManager.cards,
      ...this.cards,
    ])
  }

  get callAmount(): number {
    return this.pokerStateManager.requiredBetAmount - this.betAmount
  }

  get minRaiseAmount(): number {
    return this.pokerStateManager.baseBetAmount
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
