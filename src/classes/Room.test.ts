/* eslint-disable @typescript-eslint/require-await */
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Combination, ERROR_CODE, ROUND, Room } from '../index.js'
import { RoomData, RoomStorage } from '../types/state.js'

const { mockShuffle } = vi.hoisted(() => ({
  mockShuffle: vi.fn((cards: number[]) => [...cards]),
}))

vi.mock('../utils/shuffle.js', () => ({
  shuffle: mockShuffle,
}))

type TestRoomPayload = { title: string }
type TestPlayerPayload = { nickname: string }

const createPlayerData = (
  overrides: Partial<
    RoomData<TestRoomPayload, TestPlayerPayload>['players'][number]
  > = {},
) => ({
  id: 'player-1',
  cards: [0, 1],
  balance: 100,
  betAmount: 0,
  hasFolded: false,
  hasLost: false,
  hasTurned: false,
  payload: { nickname: 'P1' },
  ...overrides,
})

const createRoomData = (
  overrides: Partial<RoomData<TestRoomPayload, TestPlayerPayload>> = {},
): RoomData<TestRoomPayload, TestPlayerPayload> => ({
  id: 'room-1',
  cards: [2, 3, 4, 5, 6],
  round: ROUND.PREFLOP,
  dealsCount: 0,
  dealerIndex: 0,
  currentPlayerIndex: 0,
  players: [
    createPlayerData({
      id: 'player-1',
      cards: [10, 11],
      payload: { nickname: 'P1' },
    }),
    createPlayerData({
      id: 'player-2',
      cards: [20, 21],
      payload: { nickname: 'P2' },
    }),
    createPlayerData({
      id: 'player-3',
      cards: [30, 31],
      payload: { nickname: 'P3' },
    }),
  ],
  payload: { title: 'Test room' },
  ...overrides,
})

const createStorage = () => {
  const map = new Map<string, RoomData<TestRoomPayload, TestPlayerPayload>>()

  const storage: RoomStorage<TestRoomPayload, TestPlayerPayload> = {
    get: vi.fn(async (id: string) => map.get(id)),
    set: vi.fn(
      async (
        id: string,
        roomData: RoomData<TestRoomPayload, TestPlayerPayload>,
      ) => {
        map.set(id, roomData)
      },
    ),
    delete: vi.fn(async (id: string) => {
      map.delete(id)
    }),
  }

  return { storage, map }
}

const createRoom = (
  roomDataOverrides: Partial<RoomData<TestRoomPayload, TestPlayerPayload>> = {},
) => {
  const { storage, map } = createStorage()
  const roomData = createRoomData(roomDataOverrides)
  map.set(roomData.id, roomData)

  const room = new Room<TestRoomPayload, TestPlayerPayload>(
    {
      storage,
      startingBaseBetAmount: 10,
    },
    roomData,
  )

  return { room, roomData, storage, map }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockShuffle.mockImplementation((cards: number[]) => [...cards])
})

describe('Room', () => {
  describe('#constructor and getters', () => {
    test('should set all properties from room data', () => {
      const { room, roomData } = createRoom()

      expect(room.id).toBe(roomData.id)
      expect(room.cards).toStrictEqual(roomData.cards)
      expect(room.round).toBe(roomData.round)
      expect(room.dealsCount).toBe(roomData.dealsCount)
      expect(room.dealerIndex).toBe(roomData.dealerIndex)
      expect(room.currentPlayerIndex).toBe(roomData.currentPlayerIndex)
      expect(room.players.map((player) => player.id)).toStrictEqual(
        roomData.players.map((player) => player.id),
      )
      expect(room.payload).toStrictEqual(roomData.payload)
      expect(room.potAmount).toBe(0)
      expect(room.baseBetAmount).toBe(10)
      expect(room.requiredBetAmount).toBe(0)
      expect(room.currentPlayer.id).toBe('player-1')
    })

    test('should increase base bet every four deals', () => {
      const { room } = createRoom({ dealsCount: 8 })

      expect(room.baseBetAmount).toBe(30)
    })
  })

  describe('#create and #load', () => {
    test('should create room and save initial state', async () => {
      const { storage } = createStorage()

      const room = await Room.create<TestRoomPayload, TestPlayerPayload>(
        'new-room',
        {
          storage,
          startingBaseBetAmount: 5,
        },
        { title: 'Created room' },
      )

      expect(storage.set).toHaveBeenCalledTimes(1)
      expect(storage.set).toHaveBeenCalledWith(
        'new-room',
        expect.objectContaining({
          id: 'new-room',
          cards: [],
          round: ROUND.PREFLOP,
          players: [],
          payload: { title: 'Created room' },
        }),
      )
      expect(room.id).toBe('new-room')
      expect(room.players).toHaveLength(0)
    })

    test('should load existing room from storage', async () => {
      const { storage } = createStorage()
      const roomData = createRoomData()
      vi.mocked(storage.get).mockResolvedValue(roomData)

      const room = await Room.load<TestRoomPayload, TestPlayerPayload>(
        'room-1',
        {
          storage,
          startingBaseBetAmount: 10,
        },
      )

      expect(storage.get).toHaveBeenCalledWith('room-1')
      expect(room?.id).toBe('room-1')
      expect(room?.players).toHaveLength(3)
    })

    test('should return undefined when room does not exist', async () => {
      const { storage } = createStorage()
      vi.mocked(storage.get).mockResolvedValue(undefined)

      const room = await Room.load<TestRoomPayload, TestPlayerPayload>(
        'missing-room',
        {
          storage,
          startingBaseBetAmount: 10,
        },
      )

      expect(room).toBeUndefined()
    })
  })

  describe('#save', () => {
    test('should save full room data', async () => {
      const { room, storage } = createRoom()
      room.players[0].betAmount = 20
      room.players[0].balance = 80

      await room.save()

      expect(storage.set).toHaveBeenCalledWith(
        'room-1',
        expect.objectContaining({
          id: 'room-1',
          cards: [2, 3, 4, 5, 6],
          round: ROUND.PREFLOP,
          dealsCount: 0,
          dealerIndex: 0,
          currentPlayerIndex: 0,
          payload: { title: 'Test room' },
        }),
      )
    })
  })

  describe('#addPlayer', () => {
    test('should add player and persist room', async () => {
      const { room, storage } = createRoom()

      await room.addPlayer('player-4', 150, { nickname: 'P4' })

      expect(room.players).toHaveLength(4)
      expect(room.players[3].id).toBe('player-4')
      expect(room.players[3].balance).toBe(150)
      expect(storage.set).toHaveBeenCalledTimes(1)
    })
  })

  describe('#dealCards', () => {
    test('should deal cards, place blinds, emit nextDeal and move to next turn', async () => {
      const { room, storage } = createRoom()
      const nextTurnSpy = vi.spyOn(room, 'nextTurn').mockResolvedValue()
      const nextDealListener = vi.fn()
      room.on('nextDeal', nextDealListener)

      await room.dealCards()

      expect(mockShuffle).toHaveBeenCalledTimes(1)
      expect(room.dealsCount).toBe(1)
      expect(room.round).toBe(ROUND.PREFLOP)
      expect(room.cards).toStrictEqual([0, 1, 2, 3, 4])
      expect(room.players[0].cards).toStrictEqual([5, 6])
      expect(room.players[1].cards).toStrictEqual([7, 8])
      expect(room.players[2].cards).toStrictEqual([9, 10])
      expect(room.dealerIndex).toBe(1)
      expect(room.currentPlayerIndex).toBe(0)
      expect(room.players[2].betAmount).toBe(5)
      expect(room.players[0].betAmount).toBe(10)
      expect(storage.set).toHaveBeenCalled()
      expect(nextDealListener).toHaveBeenCalledWith({
        players: room.players,
        dealer: room.players[1],
        smallBlind: room.players[2],
        bigBlind: room.players[0],
      })
      expect(nextTurnSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('#endGame', () => {
    test('should emit gameEnded and delete room from storage', async () => {
      const { room, storage } = createRoom()
      const gameEndedListener = vi.fn()
      room.on('gameEnded', gameEndedListener)

      await room.endGame()

      expect(gameEndedListener).toHaveBeenCalledTimes(1)
      expect(storage.delete).toHaveBeenCalledWith('room-1')
    })
  })

  describe('player actions', () => {
    test('fold should throw WRONG_TURN for non-current player', async () => {
      const { room } = createRoom()

      await expect(room.fold('player-2')).rejects.toMatchObject({
        code: ERROR_CODE.WRONG_TURN,
      })
    })

    test('fold should throw FOLD_NOT_ALLOWED when fold is not possible', async () => {
      const { room } = createRoom()
      room.players[0].balance = 0

      await expect(room.fold('player-1')).rejects.toMatchObject({
        code: ERROR_CODE.FOLD_NOT_ALLOWED,
      })
    })

    test('fold should update player, emit event and continue', async () => {
      const { room } = createRoom()
      const nextTurnSpy = vi.spyOn(room, 'nextTurn').mockResolvedValue()
      const foldListener = vi.fn()
      room.on('fold', foldListener)

      await room.fold('player-1')

      expect(room.players[0].hasFolded).toBe(true)
      expect(room.players[0].hasTurned).toBe(true)
      expect(foldListener).toHaveBeenCalledWith({ player: room.players[0] })
      expect(nextTurnSpy).toHaveBeenCalledTimes(1)
    })

    test('check should throw WRONG_TURN for non-current player', async () => {
      const { room } = createRoom()

      await expect(room.check('player-2')).rejects.toMatchObject({
        code: ERROR_CODE.WRONG_TURN,
      })
    })

    test('check should throw CHECK_NOT_ALLOWED when check is not possible', async () => {
      const { room } = createRoom()
      room.players[1].betAmount = 10

      await expect(room.check('player-1')).rejects.toMatchObject({
        code: ERROR_CODE.CHECK_NOT_ALLOWED,
      })
    })

    test('check should update player, emit event and continue', async () => {
      const { room } = createRoom()
      const nextTurnSpy = vi.spyOn(room, 'nextTurn').mockResolvedValue()
      const checkListener = vi.fn()
      room.on('check', checkListener)

      await room.check('player-1')

      expect(room.players[0].hasTurned).toBe(true)
      expect(checkListener).toHaveBeenCalledWith({ player: room.players[0] })
      expect(nextTurnSpy).toHaveBeenCalledTimes(1)
    })

    test('call should throw WRONG_TURN for non-current player', async () => {
      const { room } = createRoom()

      await expect(room.call('player-2')).rejects.toMatchObject({
        code: ERROR_CODE.WRONG_TURN,
      })
    })

    test('call should throw CALL_NOT_ALLOWED when call is not possible', async () => {
      const { room } = createRoom()

      await expect(room.call('player-1')).rejects.toMatchObject({
        code: ERROR_CODE.CALL_NOT_ALLOWED,
      })
    })

    test('call should increase bet, emit event and continue', async () => {
      const { room } = createRoom()
      room.players[1].betAmount = 10
      const nextTurnSpy = vi.spyOn(room, 'nextTurn').mockResolvedValue()
      const callListener = vi.fn()
      room.on('call', callListener)

      await room.call('player-1')

      expect(room.players[0].betAmount).toBe(10)
      expect(room.players[0].balance).toBe(90)
      expect(room.players[0].hasTurned).toBe(true)
      expect(callListener).toHaveBeenCalledWith({ player: room.players[0] })
      expect(nextTurnSpy).toHaveBeenCalledTimes(1)
    })

    test('raise should throw WRONG_TURN for non-current player', async () => {
      const { room } = createRoom()

      await expect(room.raise('player-2', 20)).rejects.toMatchObject({
        code: ERROR_CODE.WRONG_TURN,
      })
    })

    test('raise should throw RAISE_NOT_ALLOWED when raise is not possible', async () => {
      const { room } = createRoom()
      room.players[0].balance = 0

      await expect(room.raise('player-1', 10)).rejects.toMatchObject({
        code: ERROR_CODE.RAISE_NOT_ALLOWED,
      })
    })

    test('raise should throw RAISE_AMOUNT_TOO_SMALL for too small amount', async () => {
      const { room } = createRoom()

      await expect(room.raise('player-1', 5)).rejects.toMatchObject({
        code: ERROR_CODE.RAISE_AMOUNT_TOO_SMALL,
      })
    })

    test('raise should throw RAISE_AMOUNT_TOO_BIG for too big amount', async () => {
      const { room } = createRoom()
      room.players[1].betAmount = 10

      await expect(room.raise('player-1', 200)).rejects.toMatchObject({
        code: ERROR_CODE.RAISE_AMOUNT_TOO_BIG,
      })
    })

    test('raise should increase bet, emit event and continue', async () => {
      const { room } = createRoom()
      room.players[1].betAmount = 10
      const nextTurnSpy = vi.spyOn(room, 'nextTurn').mockResolvedValue()
      const raiseListener = vi.fn()
      room.on('raise', raiseListener)

      await room.raise('player-1', 20)

      expect(room.players[0].betAmount).toBe(30)
      expect(room.players[0].balance).toBe(70)
      expect(room.players[0].hasTurned).toBe(true)
      expect(raiseListener).toHaveBeenCalledWith({
        player: room.players[0],
        amount: 20,
      })
      expect(nextTurnSpy).toHaveBeenCalledTimes(1)
    })

    test('allIn should throw WRONG_TURN for non-current player', async () => {
      const { room } = createRoom()

      await expect(room.allIn('player-2')).rejects.toMatchObject({
        code: ERROR_CODE.WRONG_TURN,
      })
    })

    test('allIn should throw ALL_IN_NOT_ALLOWED when all-in is not possible', async () => {
      const { room } = createRoom()
      room.players[0].balance = 0

      await expect(room.allIn('player-1')).rejects.toMatchObject({
        code: ERROR_CODE.ALL_IN_NOT_ALLOWED,
      })
    })

    test('allIn should move full balance to bet, emit event and continue', async () => {
      const { room } = createRoom()
      const nextTurnSpy = vi.spyOn(room, 'nextTurn').mockResolvedValue()
      const allInListener = vi.fn()
      room.on('allIn', allInListener)

      await room.allIn('player-1')

      expect(room.players[0].betAmount).toBe(100)
      expect(room.players[0].balance).toBe(0)
      expect(room.players[0].hasTurned).toBe(true)
      expect(allInListener).toHaveBeenCalledWith({ player: room.players[0] })
      expect(nextTurnSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('#nextTurn', () => {
    test('should end deal when less than two players remain in deal', async () => {
      const { room } = createRoom()
      room.players[1].hasFolded = true
      room.players[2].hasLost = true
      const endDealSpy = vi.spyOn(room, 'endDeal').mockResolvedValue()

      await room.nextTurn()

      expect(endDealSpy).toHaveBeenCalledTimes(1)
    })

    test('should end deal when everyone acted on river', async () => {
      const { room } = createRoom({
        round: ROUND.RIVER,
        players: [
          createPlayerData({
            id: 'player-1',
            betAmount: 10,
            hasTurned: true,
            payload: { nickname: 'P1' },
          }),
          createPlayerData({
            id: 'player-2',
            betAmount: 10,
            hasTurned: true,
            payload: { nickname: 'P2' },
          }),
          createPlayerData({
            id: 'player-3',
            betAmount: 10,
            hasTurned: true,
            payload: { nickname: 'P3' },
          }),
        ],
      })
      const endDealSpy = vi.spyOn(room, 'endDeal').mockResolvedValue()

      await room.nextTurn()

      expect(endDealSpy).toHaveBeenCalledTimes(1)
    })

    test('should end deal when fewer than two players have balance', async () => {
      const { room } = createRoom({
        round: ROUND.FLOP,
        players: [
          createPlayerData({
            id: 'player-1',
            betAmount: 10,
            hasTurned: true,
            balance: 0,
            payload: { nickname: 'P1' },
          }),
          createPlayerData({
            id: 'player-2',
            betAmount: 10,
            hasTurned: true,
            payload: { nickname: 'P2' },
          }),
          createPlayerData({
            id: 'player-3',
            betAmount: 10,
            hasTurned: true,
            balance: 0,
            payload: { nickname: 'P3' },
          }),
        ],
      })
      const endDealSpy = vi.spyOn(room, 'endDeal').mockResolvedValue()

      await room.nextTurn()

      expect(endDealSpy).toHaveBeenCalledTimes(1)
    })

    test('should switch to next round and emit nextTurn when everyone acted', async () => {
      const { room, storage } = createRoom({
        round: ROUND.FLOP,
        dealerIndex: 0,
        currentPlayerIndex: 0,
        players: [
          createPlayerData({
            id: 'player-1',
            betAmount: 20,
            hasTurned: true,
            payload: { nickname: 'P1' },
          }),
          createPlayerData({
            id: 'player-2',
            betAmount: 20,
            hasTurned: true,
            payload: { nickname: 'P2' },
          }),
          createPlayerData({
            id: 'player-3',
            betAmount: 20,
            hasTurned: true,
            payload: { nickname: 'P3' },
          }),
        ],
      })
      const nextTurnListener = vi.fn()
      room.on('nextTurn', nextTurnListener)

      await room.nextTurn()

      expect(room.round).toBe(ROUND.TURN)
      expect(room.players.every((player) => !player.hasTurned)).toBe(true)
      expect(room.currentPlayerIndex).toBe(1)
      expect(storage.set).toHaveBeenCalledTimes(1)
      expect(nextTurnListener).toHaveBeenCalledWith({ player: room.players[1] })
    })

    test('should move to next active player without changing round', async () => {
      const { room } = createRoom({
        round: ROUND.PREFLOP,
        currentPlayerIndex: 0,
        players: [
          createPlayerData({
            id: 'player-1',
            hasTurned: true,
            payload: { nickname: 'P1' },
          }),
          createPlayerData({
            id: 'player-2',
            hasTurned: false,
            payload: { nickname: 'P2' },
          }),
          createPlayerData({
            id: 'player-3',
            hasTurned: true,
            payload: { nickname: 'P3' },
          }),
        ],
      })

      await room.nextTurn()

      expect(room.round).toBe(ROUND.PREFLOP)
      expect(room.currentPlayerIndex).toBe(1)
    })
  })

  describe('#endDeal', () => {
    test('should distribute pot, emit dealEnded, and start a new deal', async () => {
      const { room } = createRoom({
        cards: [0, 1, 2, 3, 4],
        players: [
          createPlayerData({
            id: 'player-1',
            cards: [10, 11],
            balance: 90,
            betAmount: 10,
            payload: { nickname: 'P1' },
          }),
          createPlayerData({
            id: 'player-2',
            cards: [20, 21],
            balance: 80,
            betAmount: 20,
            payload: { nickname: 'P2' },
          }),
          createPlayerData({
            id: 'player-3',
            cards: [30, 31],
            balance: 80,
            betAmount: 20,
            hasFolded: true,
            payload: { nickname: 'P3' },
          }),
        ],
      })
      vi.spyOn(Combination, 'getBest').mockImplementation((cards) => {
        if (cards.includes(10)) return { weight: 100 } as Combination
        if (cards.includes(20)) return { weight: 100 } as Combination
        return { weight: 1 } as Combination
      })
      const dealCardsSpy = vi.spyOn(room, 'dealCards').mockResolvedValue()
      const endGameSpy = vi.spyOn(room, 'endGame').mockResolvedValue()
      const dealEndedListener = vi.fn(
        (data: { players: { player: { room: Room } }[] }) => {
          const roomCopyStorage = data.players[0].player.room.storage
          void roomCopyStorage.get('room-copy')
          void roomCopyStorage.set('room-copy', {} as never)
          void roomCopyStorage.delete('room-copy')
        },
      )
      room.on('dealEnded', dealEndedListener)

      await room.endDeal()

      expect(room.players[0].balance).toBe(105)
      expect(room.players[1].balance).toBe(115)
      expect(room.players[2].balance).toBe(80)
      expect(room.players.every((player) => player.betAmount === 0)).toBe(true)
      expect(dealEndedListener).toHaveBeenCalledWith({
        tableCards: [0, 1, 2, 3, 4],
        players: expect.arrayContaining([
          expect.objectContaining({
            player: expect.objectContaining({ id: 'player-1' }),
            wonAmount: 15,
          }),
          expect.objectContaining({
            player: expect.objectContaining({ id: 'player-2' }),
            wonAmount: 35,
          }),
          expect.objectContaining({
            player: expect.objectContaining({ id: 'player-3' }),
            wonAmount: 0,
          }),
        ]),
      })
      expect(endGameSpy).not.toHaveBeenCalled()
      expect(dealCardsSpy).toHaveBeenCalledTimes(1)
    })

    test('should mark zero-balance players as lost and end game when one remains', async () => {
      const { room } = createRoom({
        cards: [0, 1, 2, 3, 4],
        players: [
          createPlayerData({
            id: 'player-1',
            cards: [10, 11],
            balance: 0,
            betAmount: 0,
            payload: { nickname: 'P1' },
          }),
          createPlayerData({
            id: 'player-2',
            cards: [20, 21],
            balance: 40,
            betAmount: 10,
            payload: { nickname: 'P2' },
          }),
          createPlayerData({
            id: 'player-3',
            cards: [30, 31],
            balance: 0,
            betAmount: 10,
            payload: { nickname: 'P3' },
          }),
        ],
      })
      vi.spyOn(Combination, 'getBest').mockImplementation((cards) => {
        if (cards.includes(20)) return { weight: 100 } as Combination
        return { weight: 10 } as Combination
      })
      const endGameSpy = vi.spyOn(room, 'endGame').mockResolvedValue()
      const dealCardsSpy = vi.spyOn(room, 'dealCards').mockResolvedValue()

      await room.endDeal()

      expect(room.players[0].hasLost).toBe(true)
      expect(room.players[2].hasLost).toBe(true)
      expect(room.players[1].hasLost).toBe(false)
      expect(endGameSpy).toHaveBeenCalledTimes(1)
      expect(dealCardsSpy).not.toHaveBeenCalled()
    })

    test('should treat missing combination as zero weight', async () => {
      const { room } = createRoom({
        cards: [0, 1, 2, 3, 4],
        players: [
          createPlayerData({
            id: 'player-1',
            cards: [10, 11],
            balance: 50,
            betAmount: 10,
            payload: { nickname: 'P1' },
          }),
          createPlayerData({
            id: 'player-2',
            cards: [20, 21],
            balance: 50,
            betAmount: 10,
            payload: { nickname: 'P2' },
          }),
        ],
      })
      vi.spyOn(Combination, 'getBest').mockImplementation((cards) => {
        if (cards.includes(10)) return undefined
        return { weight: 100 } as Combination
      })
      const dealCardsSpy = vi.spyOn(room, 'dealCards').mockResolvedValue()
      const endGameSpy = vi.spyOn(room, 'endGame').mockResolvedValue()

      await room.endDeal()

      expect(room.players[0].balance).toBe(50)
      expect(room.players[1].balance).toBe(70)
      expect(dealCardsSpy).toHaveBeenCalledTimes(1)
      expect(endGameSpy).not.toHaveBeenCalled()
    })
  })

  describe('#getNextPlayerIndex', () => {
    test('should skip folded, lost, and zero-balance players', () => {
      const { room } = createRoom({
        players: [
          createPlayerData({
            id: 'player-1',
            hasFolded: true,
            payload: { nickname: 'P1' },
          }),
          createPlayerData({
            id: 'player-2',
            hasLost: true,
            payload: { nickname: 'P2' },
          }),
          createPlayerData({
            id: 'player-3',
            balance: 0,
            payload: { nickname: 'P3' },
          }),
          createPlayerData({
            id: 'player-4',
            payload: { nickname: 'P4' },
          }),
        ],
      })

      const index = room.getNextPlayerIndex(0)

      expect(index).toBe(3)
    })
  })

  describe('#getNextRound', () => {
    test('should return FLOP for PREFLOP', () => {
      const { room } = createRoom()

      expect(room.getNextRound(ROUND.PREFLOP)).toBe(ROUND.FLOP)
    })

    test('should return TURN for FLOP', () => {
      const { room } = createRoom()

      expect(room.getNextRound(ROUND.FLOP)).toBe(ROUND.TURN)
    })

    test('should return RIVER for all other rounds', () => {
      const { room } = createRoom()

      expect(room.getNextRound(ROUND.TURN)).toBe(ROUND.RIVER)
    })
  })
})
