import { ERROR_CODE } from '../types/error.js'
import { BaseError } from './BaseError.js'

describe('BaseError', () => {
  describe('#constructor', () => {
    it('should create error with code', () => {
      const error = new BaseError(ERROR_CODE.WRONG_TURN)

      expect(error.code).toBe(ERROR_CODE.WRONG_TURN)
      expect(error.message).toBe('')
    })

    it('should create error with code and message', () => {
      const error = new BaseError(ERROR_CODE.WRONG_TURN, 'Wrong turn')

      expect(error.code).toBe(ERROR_CODE.WRONG_TURN)
      expect(error.message).toBe('Wrong turn')
    })
  })
})
