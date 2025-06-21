import httpStatus from "../constants/httpStatus";
import { userMessage } from "../constants/message";

export type ErrorsType = Record<string, {
  msg: string;
  [key: string]: any
}>

export class ErrorWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string, status: number }) {
    this.message = message,
      this.status = status
  }
}
export class EntityError extends ErrorWithStatus {
  errors: ErrorsType
  constructor({message = userMessage.VaLIDATION_ERROR, errors}:{ message ?: string, errors: ErrorsType }) {
  super({ message, status: httpStatus.unprocessable_entity })
  this.errors = errors
} 
}