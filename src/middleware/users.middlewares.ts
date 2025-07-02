

import { checkSchema } from "express-validator"
import { validate } from "../utils/validation"
import userService from "../services/users.service"

import { userMessage } from "../constants/message"
import databaseService from "../services/database.service"
import { comparePassword } from "../utils/bycrypt"

import { verifyToken } from "../utils/jwt"
import { ErrorWithStatus } from "../model/errors"
import httpStatus from "../constants/httpStatus"
import { JsonWebTokenError } from "jsonwebtoken"
import { Request } from "express"


export const loginValidator = validate(checkSchema({
  email: {
    notEmpty: {
      errorMessage: userMessage.EMAIL_INVALID
    },
    isEmail: true,
    trim: true,
    isString: true,
    custom: {
      options: async (value, { req }) => {
        console.log("value", value)
        const user = await databaseService.users.findOne({ email: value })
        if (!user) {
          throw new Error(userMessage.Email_OR_PASSWORD_INCORRECT)
        }
        const comparePass = await comparePassword(req.body.password, user.password)
        if (!comparePass) {
          throw new Error(userMessage.Email_OR_PASSWORD_INCORRECT)
        }
        req.user = user
        // console.log("user",req.user)
        // // gán user vào req.user để sử dụng trong controller 
        return true
      }
    },

  },
  password: {
    notEmpty: {
      errorMessage: userMessage.PASSWORD_IS_REQUIRED
    },
    isLength: {
      options: {
        min: 6,
        max: 30
      },
      errorMessage: userMessage.PASSWORD_LENGTH
    },
    trim: true,
    isStrongPassword: {
      options: {
        minLength: 6,
        minSymbols: 1,
        minUppercase: 1,
        minNumbers: 1
      },
      errorMessage: userMessage.PASSWORD_MUST_BE_STRONG
    }
  },
}, ["body"]))
export const RegisterValidator = validate(checkSchema({
  name: {
    notEmpty: {
      errorMessage: userMessage.NAME_IS_REQUIRED
    },
    isString: {
      errorMessage: userMessage.NAME_MUST_BE_STRING
    },
    isLength: {
      options: {
        min: 2,
        max: 30
      },
      errorMessage: userMessage.NAME_LENGTH
    },
    trim: true,
    errorMessage: "vui lòng điền name"
  },
  email: {
    notEmpty: {
      errorMessage: userMessage.EMAIL_INVALID
    },
    isEmail: true,
    trim: true,
    isString: true,
    custom: {
      options: async (value) => {
        const result = await userService.checkEmailExit(value)
        if (result) {
          throw new Error(userMessage.EMAIL_ALREADY_EXISTS)
        }
        return true
      }
    },

  },
  password: {
    notEmpty: {
      errorMessage: userMessage.PASSWORD_IS_REQUIRED
    },
    isLength: {
      options: {
        min: 6,
        max: 30
      },
      errorMessage: userMessage.PASSWORD_LENGTH
    },
    trim: true,
    isStrongPassword: {
      options: {
        minLength: 6,
        minSymbols: 1,
        minUppercase: 1,
        minNumbers: 1
      },
      errorMessage: userMessage.PASSWORD_MUST_BE_STRONG
    }
  },
  confirm_password: {
    notEmpty: {
      errorMessage: userMessage.CONFIRM_PASSWORD_IS_REQUIRED
    },
    isLength: {
      options: {
        min: 6,
        max: 30
      },
      errorMessage: userMessage.CONFIRM_PASSWORD_LENGTH
    },
    trim: true,
    isStrongPassword: {
      options: {
        minLength: 6,
        minSymbols: 1,
        minUppercase: 1,
        minNumbers: 1
      },
      errorMessage: userMessage.CONFIRM_PASSWORD_MUST_BE_STRONG
    },
    custom: {
      options: (value, { req }) => {
        if (value !== req.body.password) {
          throw new Error(userMessage.CONFIRM_PASSWORD_NOT_MATCH)
        }
        return true
      }
    }
  },
  date_of_birth: {
    isISO8601: {
      options: {
        strict: true,
        strictSeparator: true
      },
      errorMessage: userMessage.DATE_OF_BIRTH_IS_ISO8601
    }
  }

}, ["body"]))
export const accessTokenValidator = validate(checkSchema({
  Authorization: {
    custom: {
      options: async (value: string, { req }) => {
        const access_token = (value||"").split(" ")[1]
        if (!access_token) {
          throw new ErrorWithStatus({ message: userMessage.ACCESS_TOKEN_IS_REQUIRED, status: httpStatus.UNAUTHORIZED })
        }
        try {
           const decoded_authorization = await verifyToken(access_token, process.env.JWT_SECRET_ACCESS_TOKEN as string)
           ;(req as Request).decoded_authorization = decoded_authorization
        } catch (error) {
          throw new ErrorWithStatus({
            message: (error as JsonWebTokenError).message,
            status: httpStatus.UNAUTHORIZED    
        })

      }
      return true
    }
  }
}}, ["headers"]))
export const refreshTokenValidator = validate(checkSchema({
  refresh_token: {
    trim: true,
    custom: {
      options: async (value: string, { req }) => {
        if(!value) {
          throw new ErrorWithStatus({
            message: userMessage.REFRESH_TOKEN_IS_REQUIRED,
            status: httpStatus.UNAUTHORIZED
          })
        }
        try {
          const [decoded_refresh_token, refresh_token] = await Promise.all([
            verifyToken(value, process.env.JWT_SECRET_REFRESH_TOKEN as string),
            databaseService.refreshTokens.findOne({ token: value })
          ])
          if (!refresh_token) {
            throw new ErrorWithStatus({
              message: userMessage.USED_REFRESH_TOKEN_OR_DOES_NOT_EXIST,
              status: httpStatus.UNAUTHORIZED
            })
          }
           ;(req as Request).decoded_refresh_token = decoded_refresh_token
        } catch (error) {
          if (error instanceof JsonWebTokenError) {
            throw new ErrorWithStatus({
              message: error.message,
              status: httpStatus.UNAUTHORIZED
            })
          }
          throw error
        }

        return true
      }
    }
  }
}, ["body"])
)
export const EmailverifyTokenValidator = validate(checkSchema({
 email_verify_token: {
   trim: true,
    custom: {
      options: async (value: string, { req }) => {
        if (!value) {
          throw new ErrorWithStatus({
            message: userMessage.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
            status: httpStatus.UNAUTHORIZED
          })
        }
        try {
          const decoded_email_verify_token = await 
            verifyToken(value, process.env.JWT_SECRET_EMAIL_VERIFI_TOKEN as string)
            
           ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
        } catch (error) {
           if (error instanceof JsonWebTokenError) {
            throw new ErrorWithStatus({
              message: error.message,
              status: httpStatus.UNAUTHORIZED
            })
          }
          throw error
        }
          
       

        return true
      }
    }
  }
}, ["body"])
)