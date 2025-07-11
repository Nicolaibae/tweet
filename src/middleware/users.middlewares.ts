

import { checkSchema, ParamSchema } from "express-validator"
import { validate } from "../utils/validation"
import userService from "../services/users.service"
import { userMessage } from "../constants/message"
import databaseService from "../services/database.service"
import { comparePassword, hassPassword } from "../utils/bycrypt"

import { verifyToken } from "../utils/jwt"
import { ErrorWithStatus } from "../model/errors"
import httpStatus from "../constants/httpStatus"
import { JsonWebTokenError } from "jsonwebtoken"
import { NextFunction, Request,Response } from "express"
import { ObjectId } from "mongodb"
import { Tokenpayload } from "../model/request/user.request"
import { UserVerifyStatus } from "../constants/enum"
import { REGEX_USERNAME } from "../constants/regex"

const passwordSchema: ParamSchema = {
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
}
const confirm_password_Schema: ParamSchema = {
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
}
const forgot_password_token_Schema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: userMessage.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: httpStatus.UNAUTHORIZED
        })
      }
      try {
        const decoded_forgot_password_token = await verifyToken(value, process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string)
        const { user_id } = decoded_forgot_password_token
        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
        if (user === null) {
          throw new ErrorWithStatus({
            message: userMessage.USER_NOT_FOUND,
            status: httpStatus.not_found
          })

        }
        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: userMessage.INVALID_FORGOT_PASSWORD_TOKEN,
            status: httpStatus.UNAUTHORIZED
          })
        }
        req.decoded_forgot_password_token = decoded_forgot_password_token
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
const nameSchema : ParamSchema = {
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
  }
  const date_of_birth_Schema: ParamSchema =  {
    isISO8601: {
      options: {
        strict: true,
        strictSeparator: true
      },
      errorMessage: userMessage.DATE_OF_BIRTH_IS_ISO8601
    }
  }
  const userIdSchema : ParamSchema = {
      custom:{
        options: async (value:string, { req }) => {
          if(!ObjectId.isValid(value)){
            throw new ErrorWithStatus({message:userMessage.INVALID_USER_ID,status:httpStatus.not_found})
          }
          const followed_user = await databaseService.users.findOne({ _id: new ObjectId(value) })
          if(followed_user === null) {
            throw new ErrorWithStatus({message:userMessage.USER_NOT_FOUND,status:httpStatus.not_found})
          }
      
        }
      }
    }
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
  password: passwordSchema,
  confirm_password: confirm_password_Schema,
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
        const access_token = (value || "").split(" ")[1]
        if (!access_token) {
          throw new ErrorWithStatus({ message: userMessage.ACCESS_TOKEN_IS_REQUIRED, status: httpStatus.UNAUTHORIZED })
        }
        try {
          const decoded_authorization = await verifyToken(access_token, process.env.JWT_SECRET_ACCESS_TOKEN as string)
            ; (req as Request).decoded_authorization = decoded_authorization
        } catch (error) {
          throw new ErrorWithStatus({
            message: (error as JsonWebTokenError).message,
            status: httpStatus.UNAUTHORIZED
          })

        }
        return true
      }
    }
  }
}, ["headers"]))
export const refreshTokenValidator = validate(checkSchema({
  refresh_token: {
    trim: true,
    custom: {
      options: async (value: string, { req }) => {
        if (!value) {
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
          ; (req as Request).decoded_refresh_token = decoded_refresh_token
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
          const decoded_email_verify_token = await verifyToken(value, process.env.JWT_SECRET_EMAIL_VERIFI_TOKEN as string)

            ; (req as Request).decoded_email_verify_token = decoded_email_verify_token
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
export const forgotPasswordValidator = validate(checkSchema({

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
          throw new Error(userMessage.USER_NOT_FOUND)
        }
        req.user = user

        return true
      }
    },
  }
}, ["body"]))
export const VerifyforgotPasswordValidator = validate(checkSchema({
  forgot_password_token: forgot_password_token_Schema

}, ["body"]),)
export const ResetPasswordValidator = validate(checkSchema({
  password: passwordSchema,
  confirm_password: confirm_password_Schema,
  forgot_password_token: forgot_password_token_Schema
}))
export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as Tokenpayload
  if (verify !== UserVerifyStatus.Verified) {
    return next(new ErrorWithStatus({
      message: userMessage.USER_NOT_VERIFIED,
      status: httpStatus.FORBIDDEN
    })
    )

  }
  next()
}
export const updateMeValidator = validate(checkSchema({
  name: {
    ...nameSchema,
    optional: true,
    notEmpty: undefined // nếu không có name thì không cần kiểm tra

  },
   date_of_birth: {
    ...date_of_birth_Schema,
    optional: true, // nếu không có date_of_birth thì không cần kiểm tra
    notEmpty: undefined // nếu không có date_of_birth thì không cần kiểm tra
   },
   bio:{
    
    optional: true, // nếu không có bio thì không cần kiểm tra
    isString:{
      errorMessage: userMessage.BIO_MUST_BE_STRING 
    },
    trim: true,
    isLength: {
      options: {
        min: 0, // không bắt buộc
        max: 200
      },
      errorMessage: userMessage.BIO_LENGTH
    }

   },
   location:{
    
    optional: true, // nếu không có bio thì không cần kiểm tra
    isString:{
      errorMessage: userMessage.LOCATION_MUST_BE_STRING 
    },
    trim: true,
    isLength: {
      options: {
        min: 0, // không bắt buộc
        max: 200
      },
      errorMessage: userMessage.LOCATION_LENGTH
    }

   },
   webstie:{
    
    optional: true, // nếu không có bio thì không cần kiểm tra
    isString:{
      errorMessage: userMessage.WEBSITE_MUST_BE_STRING 
    },
    trim: true,
    isLength: {
      options: {
        min: 0, // không bắt buộc
        max: 200
      },
      errorMessage: userMessage.WEBSITE_LENGTH
    }

   },
   username:{
   
    optional: true, // nếu không có bio thì không cần kiểm tra
    isString:{
      errorMessage: userMessage.USERNAME_MUST_BE_STRING 
    },
    trim: true,
    custom:{
     options: async (value, { req }) => {
      if(!REGEX_USERNAME.test(value)){
        throw Error(userMessage.USERNAME_INVALID)
      }
      const user = await databaseService.users.findOne({username:value})
      // nếu tồn tại user name trong DB k cho phép update
      if(user){
        throw Error(userMessage.USERNAME_EXISTED)
      }
     }
     
    }

   },
   avatar:{
    
    optional: true, // nếu không có bio thì không cần kiểm tra
    isString:{
      errorMessage: userMessage.AVATAR_MUST_BE_STRING 
    },
    trim: true,
    isLength: {
      options: {
        min: 0, // không bắt buộc
        max: 400
      },
      errorMessage: userMessage.AVATAR_LENGTH
    }

   },
   cover_photo:{
    
    optional: true, // nếu không có bio thì không cần kiểm tra
    isString:{
      errorMessage: userMessage.USERNAME_MUST_BE_STRING 
    },
    trim: true,
    isLength: {
      options: {
        min: 0, // không bắt buộc
        max: 400
      },
      errorMessage: userMessage.USERNAME_LENGTH
    }

   }

  
}, ["body"]))
export const followValidator = validate(checkSchema({
    followed_user_id: userIdSchema
}))
export const unfollowValidator = validate(checkSchema({
  user_id:userIdSchema
},['params']))
export const changePasswordValidator = validate(checkSchema({
  old_password:{
    ...passwordSchema,
    custom:{
      options:async (value, { req }) => {
        const {user_id} = (req as Request).decoded_authorization as Tokenpayload
        const user = await databaseService.users.findOne({_id: new ObjectId(user_id)})
          if(!user){
             throw new ErrorWithStatus({
              message: userMessage.USER_NOT_FOUND,
              status: httpStatus.not_found
            })
          }
          const {password} = user
          const isMatch = await hassPassword(value) === password
          if(!isMatch){
             throw new ErrorWithStatus({
              message: userMessage.OLD_PASSWORD_NOT_MATCH,
              status: httpStatus.UNAUTHORIZED
            })
          }
      }
    }
   
  },
  new_password: passwordSchema,
  confirm_new_password: confirm_password_Schema
})
)
