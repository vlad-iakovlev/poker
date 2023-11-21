import {
  COMBINATION_LEVEL,
  Combination,
  ROUND,
  Room,
  Subset,
} from '../index.js'
import { Player } from './Player.js'

const mockPlayerId = jest.fn(() => 'player-id')
const mockPlayerCards = jest.fn(() => [6, 7])
const mockPlayerBalance = jest.fn(() => 900)
const mockPlayerBetAmount = jest.fn(() => 10)
const mockPlayerHasFolded = jest.fn(() => false)
const mockPlayerHasLost = jest.fn(() => false)
const mockPlayerHasTurned = jest.fn(() => false)
const mockPlayerPayload = jest.fn(() => 'payload-mock')
const mockPlayerData = jest.fn(
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

const mockRoomId = jest.fn(() => 'state-id')
const mockRoomCards = jest.fn(() => [1, 2, 3, 4, 5])
const mockRoomRound = jest.fn(() => ROUND.TURN)
const mockRoomDealsCount = jest.fn(() => 3)
const mockRoomDealerIndex = jest.fn(() => 0)
const mockRoomCurrentPlayerIndex = jest.fn(() => 3)
const mockRoomPotAmount = jest.fn(() => 100)
const mockRoomBaseBetAmount = jest.fn(() => 10)
const mockRoomRequiredBetAmount = jest.fn(() => 20)
const mockRoomCurrentPlayer = jest.fn(() => ({ id: 'player-id' }) as Player)
const mockRoom = jest.fn(
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

describe('PokerPlayerManager', () => {
  let player: Player<string>
  const resetPlayer = () => {
    player = new Player<string>(mockRoom(), mockPlayerData())
  }

  beforeEach(() => {
    jest.clearAllMocks()
    resetPlayer()
  })

  describe('#constructor', () => {
    it('should set all props', () => {
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
    it('should return topBetAmount - player.betAmount', () => {
      expect(player.callAmount).toBe(10)
    })
  })

  describe('#minRaiseAmount', () => {
    it('should return baseBetAmount', () => {
      expect(player.minRaiseAmount).toBe(10)
    })
  })

  describe('#maxRaiseAmount', () => {
    it('should return player.balance - player.callAmount', () => {
      expect(player.minRaiseAmount).toBe(10)
    })
  })

  describe('#canFold', () => {
    it('should return true', () => {
      expect(player.canFold).toBe(true)
    })

    it('should return false if player.hasLost', () => {
      mockPlayerHasLost.mockReturnValueOnce(true)
      resetPlayer()

      expect(player.canFold).toBe(false)
    })

    it('should return false if player.hasFolded', () => {
      mockPlayerHasFolded.mockReturnValueOnce(true)
      resetPlayer()

      expect(player.canFold).toBe(false)
    })

    it('should return false if player.balance is 0', () => {
      mockPlayerBalance.mockReturnValueOnce(0)
      resetPlayer()

      expect(player.canFold).toBe(false)
    })
  })

  describe('#canCheck', () => {
    it('should return true if player.callAmount is 0', () => {
      mockPlayerBetAmount.mockReturnValueOnce(20)
      resetPlayer()

      expect(player.canCheck).toBe(true)
    })

    it('should return false if player.callAmount is not 0', () => {
      expect(player.canCheck).toBe(false)
    })

    it('should return false if player.hasLost', () => {
      mockPlayerHasLost.mockReturnValueOnce(true)
      resetPlayer()

      expect(player.canCheck).toBe(false)
    })

    it('should return false if player.hasFolded', () => {
      mockPlayerHasFolded.mockReturnValueOnce(true)
      resetPlayer()

      expect(player.canCheck).toBe(false)
    })

    it('should return false if player.balance is 0', () => {
      mockPlayerBalance.mockReturnValueOnce(0)
      resetPlayer()

      expect(player.canCheck).toBe(false)
    })
  })

  describe('#canCall', () => {
    it('should return true if player has enough balance', () => {
      expect(player.canCall).toBe(true)
    })

    it('should return false if player has not enough balance', () => {
      mockPlayerBalance.mockReturnValueOnce(5)
      resetPlayer()

      expect(player.canCall).toBe(false)
    })

    it('should return false if player.callAmount is 0', () => {
      mockPlayerBetAmount.mockReturnValueOnce(20)
      resetPlayer()

      expect(player.canCall).toBe(false)
    })

    it('should return false if player.hasLost', () => {
      mockPlayerHasLost.mockReturnValueOnce(true)
      resetPlayer()

      expect(player.canCall).toBe(false)
    })

    it('should return false if player.hasFolded', () => {
      mockPlayerHasFolded.mockReturnValueOnce(true)
      resetPlayer()

      expect(player.canCall).toBe(false)
    })

    it('should return false if player.balance is 0', () => {
      mockPlayerBalance.mockReturnValueOnce(0)
      resetPlayer()

      expect(player.canCall).toBe(false)
    })
  })

  describe('#canRaise', () => {
    it('should return true if player.minRaiseAmount <= player.maxRaiseAmount', () => {
      expect(player.canRaise).toBe(true)
    })

    it('should return false if player.minRaiseAmount > player.maxRaiseAmount', () => {
      mockPlayerBalance.mockReturnValueOnce(10)
      resetPlayer()

      expect(player.canRaise).toBe(false)
    })

    it('should return false if player.hasLost', () => {
      mockPlayerHasLost.mockReturnValueOnce(true)
      resetPlayer()

      expect(player.canRaise).toBe(false)
    })

    it('should return false if player.hasFolded', () => {
      mockPlayerHasFolded.mockReturnValueOnce(true)
      resetPlayer()

      expect(player.canRaise).toBe(false)
    })

    it('should return false if player.balance is 0', () => {
      mockPlayerBalance.mockReturnValueOnce(0)
      resetPlayer()

      expect(player.canRaise).toBe(false)
    })
  })

  describe('#canAllIn', () => {
    it('should return true', () => {
      expect(player.canAllIn).toBe(true)
    })

    it('should return false if player.hasLost', () => {
      mockPlayerHasLost.mockReturnValueOnce(true)
      resetPlayer()

      expect(player.canAllIn).toBe(false)
    })

    it('should return false if player.hasFolded', () => {
      mockPlayerHasFolded.mockReturnValueOnce(true)
      resetPlayer()

      expect(player.canAllIn).toBe(false)
    })

    it('should return false if player.balance is 0', () => {
      mockPlayerBalance.mockReturnValueOnce(0)
      resetPlayer()

      expect(player.canAllIn).toBe(false)
    })
  })

  describe('#bestCombination', () => {
    it('should return best combination', () => {
      expect(player.bestCombination).toStrictEqual(
        new Combination(
          COMBINATION_LEVEL.FOUR_OF_KIND,
          new Subset([7, 6, 5, 4, 1]),
        ),
      )
    })
  })

  describe('#increaseBet', () => {
    it('should increase bet', () => {
      player.increaseBet(100)

      expect(player.betAmount).toBe(110)
    })

    it('should not exceed player balance', () => {
      player.increaseBet(100500)

      expect(player.betAmount).toBe(910)
    })
  })
})
