import { EventEmitter } from 'eventemitter3'
import * as R from 'remeda'
import { ERROR_CODE } from '../types/error.js'
import { ROUND, RoomData, RoomStorage } from '../types/state.js'
import { shuffle } from '../utils/shuffle.js'
import { BaseError } from './BaseError.js'
import { Player } from './Player.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RoomParams<RoomPayload = any, PlayerPayload = any> = {
  storage: RoomStorage<RoomPayload, PlayerPayload>
  startingBaseBetAmount: number
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type RoomEvents<RoomPayload, PlayerPayload> = {
  /**
   * Emitted when deal starts
   */
  nextDeal: (data: {
    players: Player<PlayerPayload>[]
    dealer: Player<PlayerPayload>
    smallBlind: Player<PlayerPayload>
    bigBlind: Player<PlayerPayload>
  }) => void

  /**
   * Emitted when deal ends
   */
  dealEnded: (data: {
    tableCards: number[]
    players: {
      player: Player<PlayerPayload>
      wonAmount: number
    }[]
  }) => void

  /**
   * Emitted when player's turn starts
   */
  nextTurn: (data: { player: Player<PlayerPayload> }) => void

  /**
   * Emitted when game ends
   */
  gameEnded: () => void

  /**
   * Emitted when player folds
   */
  fold: (data: { player: Player<PlayerPayload> }) => void

  /**
   * Emitted when player checks
   */
  check: (data: { player: Player<PlayerPayload> }) => void

  /**
   * Emitted when player calls
   */
  call: (data: { player: Player<PlayerPayload> }) => void

  /**
   * Emitted when player raises
   */
  raise: (data: { player: Player<PlayerPayload>; amount: number }) => void

  /**
   * Emitted when player goes all-in
   */
  allIn: (data: { player: Player<PlayerPayload> }) => void
}

export class Room<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RoomPayload = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PlayerPayload = any,
> extends EventEmitter<RoomEvents<RoomPayload, PlayerPayload>> {
  storage: RoomStorage
  startingBaseBetAmount: number

  id: string
  cards: number[]
  round: ROUND
  dealsCount: number
  dealerIndex: number
  currentPlayerIndex: number
  players: Player<PlayerPayload>[]
  payload: RoomPayload

  constructor(
    params: RoomParams,
    roomData: RoomData<RoomPayload, PlayerPayload>,
  ) {
    super()

    this.storage = params.storage
    this.startingBaseBetAmount = params.startingBaseBetAmount

    this.id = roomData.id
    this.cards = roomData.cards
    this.round = roomData.round
    this.dealsCount = roomData.dealsCount
    this.dealerIndex = roomData.dealerIndex
    this.currentPlayerIndex = roomData.currentPlayerIndex
    this.players = roomData.players.map(
      (playerData) => new Player<PlayerPayload>(this, playerData),
    )
    this.payload = roomData.payload
  }

  /**
   * Create a new room
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async create<RoomPayload = any, PlayerPayload = any>(
    id: string,
    params: RoomParams<RoomPayload, PlayerPayload>,
    payload: RoomPayload,
  ): Promise<Room<RoomPayload, PlayerPayload>> {
    const roomData: RoomData<RoomPayload, PlayerPayload> = {
      id,
      cards: [],
      round: ROUND.PREFLOP,
      dealsCount: 0,
      dealerIndex: 0,
      currentPlayerIndex: 0,
      players: [],
      payload,
    }
    await params.storage.set(id, roomData)
    return new Room<RoomPayload, PlayerPayload>(params, roomData)
  }

  /**
   * Load room from storage
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async load<RoomPayload = any, PlayerPayload = any>(
    id: string,
    params: RoomParams<RoomPayload, PlayerPayload>,
  ): Promise<Room<RoomPayload, PlayerPayload> | undefined> {
    const roomData = await params.storage.get(id)
    if (!roomData) return
    return new Room<RoomPayload, PlayerPayload>(params, roomData)
  }

  async save() {
    await this.storage.set(this.id, {
      id: this.id,
      cards: this.cards,
      round: this.round,
      dealsCount: this.dealsCount,
      dealerIndex: this.dealerIndex,
      currentPlayerIndex: this.currentPlayerIndex,
      players: this.players.map((player) => ({
        id: player.id,
        cards: player.cards,
        balance: player.balance,
        betAmount: player.betAmount,
        hasFolded: player.hasFolded,
        hasLost: player.hasLost,
        hasTurned: player.hasTurned,
        payload: player.payload,
      })),
      payload: this.payload,
    })
  }

  get potAmount(): number {
    return this.players.reduce((acc, player) => acc + player.betAmount, 0)
  }

  /**
   * Bet amount for current deal
   */
  get baseBetAmount(): number {
    return (Math.floor(this.dealsCount / 4) + 1) * this.startingBaseBetAmount
  }

  /**
   * Amount that each player should have bet in order to continue playing
   */
  get requiredBetAmount(): number {
    return Math.max(...this.players.map((player) => player.betAmount))
  }

  get currentPlayer(): Player<PlayerPayload> {
    return this.players[this.currentPlayerIndex]
  }

  /**
   * Add player to room
   */
  async addPlayer(id: string, balance: number, payload: PlayerPayload) {
    this.players.push(
      new Player<PlayerPayload>(this, {
        id,
        cards: [],
        balance,
        betAmount: 0,
        hasFolded: false,
        hasLost: false,
        hasTurned: false,
        payload,
      }),
    )
    await this.save()
  }

  /**
   * Deal cards. Used to start a game
   */
  async dealCards() {
    const deck = shuffle(R.range(0, 52))
    this.dealsCount++
    this.round = ROUND.PREFLOP
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
      players: this.players.filter((player) => !player.hasLost),
      dealer: this.players[this.dealerIndex],
      smallBlind: this.players[smallBlindIndex],
      bigBlind: this.players[bigBlindIndex],
    })
    await this.nextTurn()
  }

  /**
   * End game. Used to stop a game early
   */
  async endGame() {
    this.emit('gameEnded')
    await this.storage.delete(this.id)
  }

  /**
   * Perform a fold action for a given player
   */
  async fold(playerId: string) {
    if (this.currentPlayer.id !== playerId) {
      throw new BaseError(ERROR_CODE.WRONG_TURN)
    }

    if (!this.currentPlayer.canFold) {
      throw new BaseError(ERROR_CODE.FOLD_NOT_ALLOWED)
    }

    this.currentPlayer.hasFolded = true
    this.currentPlayer.hasTurned = true
    this.emit('fold', { player: this.currentPlayer })

    await this.nextTurn()
  }

  /**
   * Perform a check action for a given player
   */
  async check(playerId: string) {
    if (this.currentPlayer.id !== playerId) {
      throw new BaseError(ERROR_CODE.WRONG_TURN)
    }

    if (!this.currentPlayer.canCheck) {
      throw new BaseError(ERROR_CODE.CHECK_NOT_ALLOWED)
    }

    this.currentPlayer.hasTurned = true
    this.emit('check', { player: this.currentPlayer })

    await this.nextTurn()
  }

  /**
   * Perform a call action for a given player
   */
  async call(playerId: string) {
    if (this.currentPlayer.id !== playerId) {
      throw new BaseError(ERROR_CODE.WRONG_TURN)
    }

    if (!this.currentPlayer.canCall) {
      throw new BaseError(ERROR_CODE.CALL_NOT_ALLOWED)
    }

    this.currentPlayer.increaseBet(this.currentPlayer.callAmount)
    this.currentPlayer.hasTurned = true
    this.emit('call', { player: this.currentPlayer })

    await this.nextTurn()
  }

  /**
   * Perform a raise action for a given player with a given amount
   */
  async raise(playerId: string, amount: number) {
    if (this.currentPlayer.id !== playerId) {
      throw new BaseError(ERROR_CODE.WRONG_TURN)
    }

    if (!this.currentPlayer.canRaise) {
      throw new BaseError(ERROR_CODE.RAISE_NOT_ALLOWED)
    }

    if (amount < this.currentPlayer.minRaiseAmount) {
      throw new BaseError(ERROR_CODE.RAISE_AMOUNT_TOO_SMALL)
    }

    if (amount > this.currentPlayer.maxRaiseAmount) {
      throw new BaseError(ERROR_CODE.RAISE_AMOUNT_TOO_BIG)
    }

    this.currentPlayer.increaseBet(this.currentPlayer.callAmount + amount)
    this.currentPlayer.hasTurned = true
    this.emit('raise', { player: this.currentPlayer, amount })

    await this.nextTurn()
  }

  /**
   * Perform an all-in action for a given player
   */
  async allIn(playerId: string) {
    if (this.currentPlayer.id !== playerId) {
      throw new BaseError(ERROR_CODE.WRONG_TURN)
    }

    if (!this.currentPlayer.canAllIn) {
      throw new BaseError(ERROR_CODE.ALL_IN_NOT_ALLOWED)
    }

    this.currentPlayer.increaseBet(this.currentPlayer.balance)
    this.currentPlayer.hasTurned = true
    this.emit('allIn', { player: this.currentPlayer })

    await this.nextTurn()
  }

  async nextTurn() {
    const playersInDeal = this.players.filter(
      (player) => !player.hasLost && !player.hasFolded,
    )
    const playersWithBalance = playersInDeal.filter((player) => player.balance)
    const playersWhoNeedToTurn = playersWithBalance.filter(
      (player) =>
        !player.hasTurned || player.betAmount !== this.requiredBetAmount,
    )

    if (playersInDeal.length < 2) {
      return this.endDeal()
    }

    if (!playersWhoNeedToTurn.length) {
      if (this.round === ROUND.RIVER || playersWithBalance.length < 2) {
        return this.endDeal()
      }

      this.players.forEach((player) => void (player.hasTurned = false))
      this.round = this.getNextRound(this.round)
      this.currentPlayerIndex = this.dealerIndex
    }

    this.currentPlayerIndex = this.getNextPlayerIndex(this.currentPlayerIndex)
    await this.save()

    this.emit('nextTurn', { player: this.currentPlayer })
  }

  async endDeal() {
    const winners = new Map<string, number>()

    // Loops until no one has any bets left. Used to properly count all-ins
    while (this.potAmount) {
      let playersWithBetsCount = 0
      let minBetAmount = Infinity
      let bestCombinationWeight = 0
      const currentWinners = new Set<string>()

      // Calculates minimum bet amount and finds winners with bets left
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
          currentWinners.add(player.id)
        } else if (weight === bestCombinationWeight) {
          currentWinners.add(player.id)
        }
      })

      const wonAmount =
        (minBetAmount * playersWithBetsCount) / currentWinners.size

      // Updates bets and winners
      this.players.forEach((player) => {
        if (player.betAmount) {
          player.betAmount -= minBetAmount
        }

        if (currentWinners.has(player.id)) {
          player.balance += wonAmount
          winners.set(player.id, (winners.get(player.id) ?? 0) + wonAmount)
        }
      })
    }

    // Creates a copy of the room to emit the dealEnded event with the correct data
    const roomCopy = new Room<RoomPayload, PlayerPayload>(
      {
        storage: {
          get: () => Promise.resolve(undefined),
          set: () => Promise.resolve(),
          delete: () => Promise.resolve(),
        },
        startingBaseBetAmount: this.startingBaseBetAmount,
      },
      {
        id: this.id,
        cards: this.cards,
        round: this.round,
        dealsCount: this.dealsCount,
        dealerIndex: this.dealerIndex,
        currentPlayerIndex: this.currentPlayerIndex,
        players: this.players.map((player) => ({
          id: player.id,
          cards: player.cards,
          balance: player.balance,
          betAmount: player.betAmount,
          hasFolded: player.hasFolded,
          hasLost: player.hasLost,
          hasTurned: player.hasTurned,
          payload: player.payload,
        })),
        payload: this.payload,
      },
    )

    this.emit('dealEnded', {
      tableCards: roomCopy.cards,
      players: roomCopy.players
        .filter((player) => !player.hasLost)
        .map((player) => ({
          player,
          wonAmount: winners.get(player.id) ?? 0,
        })),
    })

    // Marks players who have lost
    this.players.forEach((player) => {
      if (player.balance === 0) {
        player.hasLost = true
      }
    })

    // Ends the game if there are less than 2 players left, or starts a new deal
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

  getNextRound(round: ROUND): ROUND {
    switch (round) {
      case ROUND.PREFLOP:
        return ROUND.FLOP
      case ROUND.FLOP:
        return ROUND.TURN
      default:
        return ROUND.RIVER
    }
  }
}
