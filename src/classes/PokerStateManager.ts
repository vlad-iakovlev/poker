import { EventEmitter } from 'eventemitter3'
import * as R from 'remeda'
import { ERROR_CODE } from '../types/error.js'
import { POKER_ROUND, PokerState, PokerStateStorage } from '../types/state.js'
import { shuffle } from '../utils/shuffle.js'
import { PokerError } from './PokerError.js'
import { PokerPlayerManager } from './PokerPlayerManger.js'

export type PokerStateManagerParams = {
  storage: PokerStateStorage
  startingBaseBetAmount: number
}

export type PokerStateManagerEvents = {
  nextDeal: (data: {
    dealerId: string
    smallBlindId: string
    bigBlindId: string
  }) => void
  dealEnded: (data: { winners: Record<string, number> }) => void
  nextTurn: (data: { userId: string }) => void
  gameEnded: () => void
  fold: (data: { userId: string }) => void
  check: (data: { userId: string }) => void
  call: (data: { userId: string }) => void
  raise: (data: { userId: string; amount: number }) => void
  allIn: (data: { userId: string }) => void
}

export class PokerStateManager extends EventEmitter<PokerStateManagerEvents> {
  storage: PokerStateStorage
  startingBaseBetAmount: number

  id: string
  roomId: string
  cards: number[]
  round: POKER_ROUND
  dealsCount: number
  dealerIndex: number
  currentPlayerIndex: number
  players: PokerPlayerManager[]

  private constructor(params: PokerStateManagerParams, stateData: PokerState) {
    super()

    this.storage = params.storage
    this.startingBaseBetAmount = params.startingBaseBetAmount

    this.id = stateData.id
    this.roomId = stateData.roomId
    this.cards = stateData.cards
    this.round = stateData.round
    this.dealsCount = stateData.dealsCount
    this.dealerIndex = stateData.dealerIndex
    this.currentPlayerIndex = stateData.currentPlayerIndex
    this.players = stateData.players.map(
      (playerData) => new PokerPlayerManager(this, playerData),
    )
  }

  static async loadByTgChatIdOrCreate(
    params: PokerStateManagerParams,
    roomId: string,
  ): Promise<PokerStateManager> {
    const stateData = await params.storage.upsertRoom({
      where: {
        roomId,
      },
      create: {
        roomId,
        cards: [],
        round: POKER_ROUND.PREFLOP,
        dealsCount: 0,
        dealerIndex: 0,
        currentPlayerIndex: 0,
        players: [],
      },
      update: {},
    })

    return new PokerStateManager(params, stateData)
  }

  async save() {
    await this.storage.updateRoom({
      where: {
        id: this.id,
      },
      data: {
        cards: this.cards,
        round: this.round,
        dealsCount: this.dealsCount,
        dealerIndex: this.dealerIndex,
        currentPlayerIndex: this.currentPlayerIndex,
        players: this.players.map((player) => ({
          id: player.id,
          userId: player.userId,
          cards: player.cards,
          balance: player.balance,
          betAmount: player.betAmount,
          hasFolded: player.hasFolded,
          hasLost: player.hasLost,
          hasTurned: player.hasTurned,
        })),
      },
    })
  }

  get potAmount(): number {
    return this.players.reduce((acc, player) => acc + player.betAmount, 0)
  }

  get baseBetAmount(): number {
    return (Math.floor(this.dealsCount / 4) + 1) * this.startingBaseBetAmount
  }

  get requiredBetAmount(): number {
    return Math.max(...this.players.map((player) => player.betAmount))
  }

  get currentPlayer(): PokerPlayerManager {
    return this.players[this.currentPlayerIndex]
  }

  async addPlayer(params: { userId: string; balance: number }) {
    const playerData = await this.storage.createPlayer({
      data: {
        userId: params.userId,
        cards: [],
        balance: params.balance,
        betAmount: 0,
        hasFolded: false,
        hasLost: false,
        hasTurned: false,
      },
    })

    this.players.push(new PokerPlayerManager(this, playerData))
  }

  async dealCards() {
    const deck = shuffle(R.range(0, 52))
    this.dealsCount++
    this.round = POKER_ROUND.PREFLOP
    this.cards = deck.splice(0, 5)
    this.players.forEach((player) => {
      player.betAmount = 0
      player.cards = deck.splice(0, 2)
      player.hasFolded = false
      player.hasTurned = false
    })

    this.dealerIndex = this.getNextPlayerIndex(this.dealerIndex)
    const smallBlindIndex = this.getNextPlayerIndex(this.dealerIndex)
    const bigBlindIndex = this.getNextPlayerIndex(smallBlindIndex)
    this.currentPlayerIndex = bigBlindIndex
    this.players[smallBlindIndex].increaseBet(this.baseBetAmount / 2)
    this.players[bigBlindIndex].increaseBet(this.baseBetAmount)
    await this.save()

    this.emit('nextDeal', {
      dealerId: this.players[this.dealerIndex].userId,
      smallBlindId: this.players[smallBlindIndex].userId,
      bigBlindId: this.players[bigBlindIndex].userId,
    })
    await this.nextTurn()
  }

  async endGame() {
    this.emit('gameEnded')

    await this.storage.deleteRoom({
      where: {
        id: this.id,
      },
    })
  }

  async fold(userId: string) {
    if (this.currentPlayer.userId !== userId) {
      throw new PokerError(ERROR_CODE.WRONG_TURN)
    }

    if (!this.currentPlayer.canFold) {
      throw new PokerError(ERROR_CODE.FOLD_NOT_ALLOWED)
    }

    this.currentPlayer.hasFolded = true
    this.currentPlayer.hasTurned = true
    this.emit('fold', { userId })

    await this.nextTurn()
  }

  async check(userId: string) {
    if (this.currentPlayer.userId !== userId) {
      throw new PokerError(ERROR_CODE.WRONG_TURN)
    }

    if (!this.currentPlayer.canCheck) {
      throw new PokerError(ERROR_CODE.CHECK_NOT_ALLOWED)
    }

    this.currentPlayer.hasTurned = true
    this.emit('check', { userId })

    await this.nextTurn()
  }

  async call(userId: string) {
    if (this.currentPlayer.userId !== userId) {
      throw new PokerError(ERROR_CODE.WRONG_TURN)
    }

    if (!this.currentPlayer.canCall) {
      throw new PokerError(ERROR_CODE.CALL_NOT_ALLOWED)
    }

    this.currentPlayer.increaseBet(this.currentPlayer.callAmount)
    this.currentPlayer.hasTurned = true
    this.emit('call', { userId })

    await this.nextTurn()
  }

  async raise(userId: string, amount: number) {
    if (this.currentPlayer.userId !== userId) {
      throw new PokerError(ERROR_CODE.WRONG_TURN)
    }

    if (!this.currentPlayer.canRaise) {
      throw new PokerError(ERROR_CODE.RAISE_NOT_ALLOWED)
    }

    if (amount < this.currentPlayer.minRaiseAmount) {
      throw new PokerError(ERROR_CODE.RAISE_AMOUNT_TOO_SMALL)
    }

    if (amount > this.currentPlayer.maxRaiseAmount) {
      throw new PokerError(ERROR_CODE.RAISE_AMOUNT_TOO_BIG)
    }

    this.currentPlayer.increaseBet(this.currentPlayer.callAmount + amount)
    this.currentPlayer.hasTurned = true
    this.emit('raise', { userId, amount })

    await this.nextTurn()
  }

  async allIn(userId: string) {
    if (this.currentPlayer.userId !== userId) {
      throw new PokerError(ERROR_CODE.WRONG_TURN)
    }

    if (!this.currentPlayer.canAllIn) {
      throw new PokerError(ERROR_CODE.ALL_IN_NOT_ALLOWED)
    }

    this.currentPlayer.increaseBet(this.currentPlayer.balance)
    this.currentPlayer.hasTurned = true
    this.emit('allIn', { userId })

    await this.nextTurn()
  }

  async nextTurn() {
    // TODO: skip waiting for check when only one player left

    if (
      this.players.filter((player) => !player.hasLost && !player.hasFolded)
        .length < 2
    ) {
      return this.endDeal()
    }

    if (
      this.players.every(
        (player) =>
          player.hasLost ||
          player.hasFolded ||
          !player.balance ||
          (player.hasTurned && player.betAmount === this.requiredBetAmount),
      )
    ) {
      if (this.round === POKER_ROUND.RIVER) {
        return this.endDeal()
      }

      this.players.forEach((player) => void (player.hasTurned = false))
      this.round = this.getNextRound(this.round)
      this.currentPlayerIndex = this.dealerIndex
    }

    this.currentPlayerIndex = this.getNextPlayerIndex(this.currentPlayerIndex)
    await this.save()

    this.emit('nextTurn', { userId: this.currentPlayer.userId })
  }

  async endDeal() {
    const winners = new Map<string, number>()

    while (this.potAmount) {
      let playersWithBetsCount = 0
      let minBetAmount = Infinity
      let bestCombinationWeight = 0
      const currentWinners = new Set<string>()

      this.players.forEach((player) => {
        if (!player.betAmount) return

        playersWithBetsCount++

        if (player.betAmount < minBetAmount) {
          minBetAmount = player.betAmount
        }

        if (player.hasLost || player.hasFolded) return

        const weight = player.bestCombination?.weight ?? 0

        if (weight > bestCombinationWeight) {
          bestCombinationWeight = weight
          currentWinners.clear()
          currentWinners.add(player.userId)
        } else if (weight === bestCombinationWeight) {
          currentWinners.add(player.userId)
        }
      })

      this.players.forEach((player) => {
        player.betAmount -= minBetAmount

        if (currentWinners.has(player.userId)) {
          winners.set(
            player.userId,
            (winners.get(player.userId) ?? 0) +
              (minBetAmount * playersWithBetsCount) / currentWinners.size,
          )
        }
      })
    }

    this.players.forEach((player) => {
      player.balance += winners.get(player.userId) ?? 0

      if (player.balance === 0) {
        player.hasLost = true
      }
    })

    this.emit('dealEnded', { winners: Object.fromEntries(winners) })

    if (this.players.filter((player) => !player.hasLost).length < 2) {
      await this.endGame()
    } else {
      await this.dealCards()
    }
  }

  getNextPlayerIndex(index: number): number {
    do {
      index += 1
      index %= this.players.length
    } while (
      this.players[index].hasLost ||
      this.players[index].hasFolded ||
      !this.players[index].balance
    )

    return index
  }

  getNextRound(round: POKER_ROUND): POKER_ROUND {
    switch (round) {
      case POKER_ROUND.PREFLOP:
        return POKER_ROUND.FLOP
      case POKER_ROUND.FLOP:
        return POKER_ROUND.TURN
      default:
        return POKER_ROUND.RIVER
    }
  }
}
