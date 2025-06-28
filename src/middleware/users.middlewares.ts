

import { checkSchema } from "express-validator"
import { validate } from "../utils/validation"
import userService from "../services/users.service"

import { userMessage } from "../constants/message"
import databaseService from "../services/database.service"
import { comparePassword } from "../utils/bycrypt"

import { verifyToken } from "../utils/jwt"
import { ErrorWithStatus } from "../model/errors"
import httpStatus from "../constants/httpStatus"

export const loginValidator = validate(checkSchema({
  email:{
    notEmpty:{
      errorMessage:userMessage.EMAIL_INVALID
    },
    isEmail:true,
    trim:true,
    isString:true,
    custom:{
      options:async(value,{req})=>{
        console.log("value",value)
        const user = await databaseService.users.findOne({email:value})
        if(!user){
          throw new Error(userMessage.Email_OR_PASSWORD_INCORRECT)
        }
        const comparePass = await comparePassword(req.body.password,user.password)
        if(!comparePass){ 
          throw new Error(userMessage.Email_OR_PASSWORD_INCORRECT)
        }
        req.user = user
        // console.log("user",req.user)
        // // gán user vào req.user để sử dụng trong controller 
        return true
      }
    },

  },
  password:{
    notEmpty:{
      errorMessage:userMessage.PASSWORD_IS_REQUIRED},
    isLength:{
      options:{
        min:6,
        max:30
      },
      errorMessage:userMessage.PASSWORD_LENGTH
    },
    trim:true,
    isStrongPassword:{
      options:{
        minLength:6,
        minSymbols:1,
        minUppercase:1,
        minNumbers:1
      },
      errorMessage:userMessage.PASSWORD_MUST_BE_STRONG
    }
  },
},["body"]))
export const RegisterValidator = validate(checkSchema({
  name:{
    notEmpty:{
      errorMessage:userMessage.NAME_IS_REQUIRED
    },
    isString:{
      errorMessage:userMessage.NAME_MUST_BE_STRING
    },
    isLength:{
      options:{
        min:2,
        max:30
      },
      errorMessage:userMessage.NAME_LENGTH
    },
    trim:true,
    errorMessage:"vui lòng điền name"
  },
  email:{
    notEmpty:{
      errorMessage:userMessage.EMAIL_INVALID
    },
    isEmail:true,
    trim:true,
    isString:true,
    custom:{
      options:async(value)=>{
        const result = await userService.checkEmailExit(value)
        if(result){
          throw new Error(userMessage.EMAIL_ALREADY_EXISTS)
        }
        return true
      }
    },

  },
  password:{
    notEmpty:{
      errorMessage:userMessage.PASSWORD_IS_REQUIRED},
    isLength:{
      options:{
        min:6,
        max:30
      },
      errorMessage:userMessage.PASSWORD_LENGTH
    },
    trim:true,
    isStrongPassword:{
      options:{
        minLength:6,
        minSymbols:1,
        minUppercase:1,
        minNumbers:1
      },
      errorMessage:userMessage.PASSWORD_MUST_BE_STRONG
    }
  },
  confirm_password:{
    notEmpty:{
      errorMessage:userMessage.CONFIRM_PASSWORD_IS_REQUIRED},
    isLength:{
      options:{
        min:6,
        max:30
      },
      errorMessage:userMessage.CONFIRM_PASSWORD_LENGTH
    },
    trim:true,
    isStrongPassword:{
      options:{
        minLength:6,
        minSymbols:1,
        minUppercase:1,
        minNumbers:1
      },
      errorMessage:userMessage.CONFIRM_PASSWORD_MUST_BE_STRONG
    },
    custom:{
      options:(value,{req})=>{
        if(value !== req.body.password){
          throw new Error(userMessage.CONFIRM_PASSWORD_NOT_MATCH)
        }
        return true
      }
    }
  },
  date_of_birth:{
    isISO8601:{
      options:{
        strict:true,
        strictSeparator:true
      },
      errorMessage:userMessage.DATE_OF_BIRTH_IS_ISO8601
    }
  }

},["body"]))
export const accessTokenValidator = validate(checkSchema({
  Authorization:{
    notEmpty:{
      errorMessage:userMessage.ACCESS_TOKEN_IS_REQUIRED
    },
    custom:{
      options:async(value:string,{req})=>{
        const access_token = value.split(" ")[1]
        if(!access_token){
          throw new ErrorWithStatus({message:userMessage.ACCESS_TOKEN_IS_REQUIRED,status:httpStatus.UNAUTHORIZED})
        }
        const decoded_authorization = await verifyToken(access_token)
        req.decoded_authorization = decoded_authorization
        return true

      }
  }
}},["headers"]))