import { Request } from 'express'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ErrorWithStatus } from '../model/errors'
import { userMessage } from '../constants/message'
import httpStatus from '../constants/httpStatus'
import { verifyToken } from './jwt'
import { config } from 'dotenv'

config()
export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number') as number[]
}
export const verifyAccessToken = async (access_token: string, req?: Request) => {
  if (!access_token) {
    throw new ErrorWithStatus({
      message: userMessage.ACCESS_TOKEN_IS_REQUIRED,
      status: httpStatus.UNAUTHORIZED
    })
  }
  try {
    const decoded_authorization = await verifyToken(
      access_token,
      process.env.JWT_SECRET_ACCESS_TOKEN as string
    )
    if (req) {
      ;(req as Request).decoded_authorization = decoded_authorization
      return true
    }
    return decoded_authorization
  } catch (error) {
    throw new ErrorWithStatus({
      message: capitalize((error as JsonWebTokenError).message),
      status: httpStatus.UNAUTHORIZED
    })
  }
}