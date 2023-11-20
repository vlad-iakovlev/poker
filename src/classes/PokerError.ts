import { ERROR_CODE } from '../types/error.js'

export class PokerError extends Error {
  code: ERROR_CODE

  constructor(code: ERROR_CODE, message?: string) {
    super(message)
    this.code = code
  }
}
