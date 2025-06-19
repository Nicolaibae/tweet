
import { Request,Response,NextFunction} from "express"
import { checkSchema } from "express-validator"
import { validate } from "../utils/validation"
import userService from "../services/users.service"
export const loginValidator = (req:Request,res:Response,next:NextFunction) =>{
  const {email,password}= req.body
  if(!email || !password){
    res.status(400).json({
      error:"Missing email or password"
    })
  }
  next()

}
export const RegisterValidator = validate(checkSchema({
  name:{
    notEmpty:true,
    isLength:{
      options:{
        min:2,
        max:30
      }
    },
    trim:true,
    errorMessage:"vui lòng điền name"
  },
  email:{
    notEmpty:true,
    isEmail:true,
    trim:true,
    isString:true,
    custom:{
      options:async(value)=>{
        const result = await userService.checkEmail(value)
        if(result){
          throw new Error("đã tồn tại email")
        }
        return result
      }
    },
    errorMessage:"email không đúng định dạng"
  },
  password:{
    notEmpty:true,
    isLength:{
      options:{
        min:6,
        max:30
      }
    },
    trim:true,
    isStrongPassword:{
      options:{
        minLength:6,
        minSymbols:1,
        minUppercase:1,
        minNumbers:1
      }
    }
  },
  confirm_password:{
    notEmpty:true,
    isLength:{
      options:{
        min:6,
        max:30
      }
    },
    trim:true,
    isStrongPassword:{
      options:{
        minLength:6,
        minSymbols:1,
        minUppercase:1,
        minNumbers:1
      }
    },
    custom:{
      options:(value,{req})=>{
        if(value != req.body.password){
          throw new Error("Password confirm không khớp")
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
      }
    }
  }

}))