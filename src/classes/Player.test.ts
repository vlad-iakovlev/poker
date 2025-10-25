import { beforeEach } from 'node:test'
import { describe, expect, test, vi } from 'vitest'
import {
  COMBINATION_LEVEL,
  Combination,
  ROUND,
  Room,
  Subset,
} from '../index.js'
import { Player } from './Player.js'

const mockPlayerId = vi.fn(() => 'player-id')
const mockPlayerCards = vi.fn(() => [6, 7])
const mockPlayerBalance = vi.fn(() => 900)
const mockPlayerBetAmount = vi.fn(() => 10)
const mockPlayerHasFolded = vi.fn(() => false)
const mockPlayerHasLost = vi.fn(() => false)
const mockPlayerHasTurned = vi.fn(() => false)
const mockPlayerPayload = vi.fn(() => 'payload-mock')
const mockPlayerData = vi.fn(
  () =>
    ({
      id: mockPlayerId(),
      cards: mockPlayerCards(),
      balance: mockPlayerBalance(),
      betAmount: mockPlayerBetAmount(),
      hasFolded: mockPlayerHasFolded(),
      hasLost: mockPlayerHasLost(),
      hasTurned: mockPlayerHasTurned(),
      payload: mockPlayerPayload(),
    }) as Player<string>,
)

const mockRoomId = vi.fn(() => 'state-id')
const mockRoomCards = vi.fn(() => [1, 2, 3, 4, 5])
const mockRoomRound = vi.fn(() => ROUND.TURN)
const mockRoomDealsCount = vi.fn(() => 3)
const mockRoomDealerIndex = vi.fn(() => 0)
const mockRoomCurrentPlayerIndex = vi.fn(() => 3)
const mockRoomPotAmount = vi.fn(() => 100)
const mockRoomBaseBetAmount = vi.fn(() => 10)
const mockRoomRequiredBetAmount = vi.fn(() => 20)
const mockRoomCurrentPlayer = vi.fn(() => ({ id: 'player-id' }) as Player)
const mockRoom = vi.fn(
  () =>
    ({
      id: mockRoomId(),
      cards: mockRoomCards(),
      round: mockRoomRound(),
      dealsCount: mockRoomDealsCount(),
      dealerIndex: mockRoomDealerIndex(),
      currentPlayerIndex: mockRoomCurrentPlayerIndex(),
      potAmount: mockRoomPotAmount(),
      baseBetAmount: mockRoomBaseBetAmount(),
      requiredBetAmount: mockRoomRequiredBetAmount(),
      currentPlayer: mockRoomCurrentPlayer(),
    }) as Room<any, string>,
)

beforeEach(() => {
  vi.clearAllMocks()
})

const createPlayer = () => new Player<string>(mockRoom(), mockPlayerData())

describe('PokerPlayerManager', () => {
  describe('#constructor', () => {
    test('should set all props', () => {
      const player = createPlayer()

      expect(player.room).toStrictEqual(mockRoom())
      expect(player.id).toBe(mockPlayerId())
      expect(player.cards).toStrictEqual(mockPlayerCards())
      expect(player.balance).toBe(mockPlayerBalance())
      expect(player.betAmount).toBe(mockPlayerBetAmount())
      expect(player.hasFolded).toBe(mockPlayerHasFolded())
      expect(player.hasLost).toBe(mockPlayerHasLost())
      expect(player.hasTurned).toBe(mockPlayerHasTurned())
      expect(player.payload).toStrictEqual(mockPlayerPayload())
    })
  })

  describe('#callAmount', () => {
    test('should return topBetAmount - player.betAmount', () => {
      const player = createPlayer()

      expect(player.callAmount).toBe(10)
    })
  })

  describe('#minRaiseAmount', () => {
    test('should return baseBetAmount', () => {
      const player = createPlayer()

      expect(player.minRaiseAmount).toBe(10)
    })
  })

  describe('#maxRaiseAmount', () => {
    test('should return player.balance - player.callAmount', () => {
      const player = createPlayer()

      expect(player.minRaiseAmount).toBe(10)
    })
  })

  describe('#canFold', () => {
    test('should return true', () => {
      const player = createPlayer()

      expect(player.canFold).toBe(true)
    })

    test('should return false if player.hasLost', () => {
      mockPlayerHasLost.mockReturnValueOnce(true)
      const player = createPlayer()

      expect(player.canFold).toBe(false)
    })

    test('should return false if player.hasFolded', () => {
      mockPlayerHasFolded.mockReturnValueOnce(true)
      const player = createPlayer()

      expect(player.canFold).toBe(false)
    })

    test('should return false if player.balance is 0', () => {
      mockPlayerBalance.mockReturnValueOnce(0)
      const player = createPlayer()

      expect(player.canFold).toBe(false)
    })
  })

  describe('#canCheck', () => {
    test('should return true if player.callAmount is 0', () => {
      mockPlayerBetAmount.mockReturnValueOnce(20)
      const player = createPlayer()

      expect(player.canCheck).toBe(true)
    })

    test('should return false if player.callAmount is not 0', () => {
      const player = createPlayer()

      expect(player.canCheck).toBe(false)
    })

    test('should return false if player.hasLost', () => {
      mockPlayerHasLost.mockReturnValueOnce(true)
      const player = createPlayer()

      expect(player.canCheck).toBe(false)
    })

    test('should return false if player.hasFolded', () => {
      mockPlayerHasFolded.mockReturnValueOnce(true)
      const player = createPlayer()

      expect(player.canCheck).toBe(false)
    })

    test('should return false if player.balance is 0', () => {
      mockPlayerBalance.mockReturnValueOnce(0)
      const player = createPlayer()

      expect(player.canCheck).toBe(false)
    })
  })

  describe('#canCall', () => {
    test('should return true if player has enough balance', () => {
      const player = createPlayer()

      expect(player.canCall).toBe(true)
    })

    test('should return false if player has not enough balance', () => {
      mockPlayerBalance.mockReturnValueOnce(5)
      const player = createPlayer()

      expect(player.canCall).toBe(false)
    })

    test('should return false if player.callAmount is 0', () => {
      mockPlayerBetAmount.mockReturnValueOnce(20)
      const player = createPlayer()

      expect(player.canCall).toBe(false)
    })

    test('should return false if player.hasLost', () => {
      mockPlayerHasLost.mockReturnValueOnce(true)
      const player = createPlayer()

      expect(player.canCall).toBe(false)
    })

    test('should return false if player.hasFolded', () => {
      mockPlayerHasFolded.mockReturnValueOnce(true)
      const player = createPlayer()

      expect(player.canCall).toBe(false)
    })

    test('should return false if player.balance is 0', () => {
      mockPlayerBalance.mockReturnValueOnce(0)
      const player = createPlayer()

      expect(player.canCall).toBe(false)
    })
  })

  describe('#canRaise', () => {
    test('should return true if player.minRaiseAmount <= player.maxRaiseAmount', () => {
      const player = createPlayer()

      expect(player.canRaise).toBe(true)
    })

    test('should return false if player.minRaiseAmount > player.maxRaiseAmount', () => {
      mockPlayerBalance.mockReturnValueOnce(10)
      const player = createPlayer()

      expect(player.canRaise).toBe(false)
    })

    test('should return false if player.hasLost', () => {
      mockPlayerHasLost.mockReturnValueOnce(true)
      const player = createPlayer()

      expect(player.canRaise).toBe(false)
    })

    test('should return false if player.hasFolded', () => {
      mockPlayerHasFolded.mockReturnValueOnce(true)
      const player = createPlayer()

      expect(player.canRaise).toBe(false)
    })

    test('should return false if player.balance is 0', () => {
      mockPlayerBalance.mockReturnValueOnce(0)
      const player = createPlayer()

      expect(player.canRaise).toBe(false)
    })
  })

  describe('#canAllIn', () => {
    test('should return true', () => {
      const player = createPlayer()

      expect(player.canAllIn).toBe(true)
    })

    test('should return false if player.hasLost', () => {
      mockPlayerHasLost.mockReturnValueOnce(true)
      const player = createPlayer()

      expect(player.canAllIn).toBe(false)
    })

    test('should return false if player.hasFolded', () => {
      mockPlayerHasFolded.mockReturnValueOnce(true)
      const player = createPlayer()

      expect(player.canAllIn).toBe(false)
    })

    test('should return false if player.balance is 0', () => {
      mockPlayerBalance.mockReturnValueOnce(0)
      const player = createPlayer()

      expect(player.canAllIn).toBe(false)
    })
  })

  describe('#bestCombination', () => {
    test('should return best combination', () => {
      const player = createPlayer()

      expect(player.bestCombination).toStrictEqual(
        new Combination(
          COMBINATION_LEVEL.FOUR_OF_KIND,
          new Subset([7, 6, 5, 4, 1]),
        ),
      )
    })
  })

  describe('#increaseBet', () => {
    test('should increase bet', () => {
      const player = createPlayer()

      player.increaseBet(100)

      expect(player.betAmount).toBe(110)
    })

    test('should not exceed player balance', () => {
      const player = createPlayer()

      player.increaseBet(100500)

      expect(player.betAmount).toBe(910)
    })
  })
})
