
import databaseService from "./database.service"
import User from "../model/schemas/User.schema"
import { hassPassword } from "../utils/bycrypt"
import { signToken } from "../utils/jwt"
import { TokenType, UserVerifyStatus } from "../constants/enum"
import { ObjectId } from "mongodb"
import RefreshToken from "../model/schemas/RefreshToken.schema"
import { config } from "dotenv"
import { userMessage } from "../constants/message"
import { registerReqBody } from "../model/request/user.request"
config()
class UserService{
  private SignAccessToken(user_id:string){
    

    return signToken({
      payload:{
        user_id,
        token_type:TokenType.AccessToken
      },
      privateKey:process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options:{
        expiresIn: process.env.Access_Token_Exp
      }
    })
  }
  private SignEmailVerifyToken(user_id:string){
    

    return signToken({
      payload:{
        user_id,
        token_type:TokenType.EmailVerifyToken
      },
      privateKey:process.env.JWT_SECRET_EMAIL_VERIFI_TOKEN as string,
      options:{
        expiresIn: process.env.Email_Verify_Token_Exp
      }
    })
  }
  private SignRefrehToken(user_id:string){
    return signToken({
      payload:{
        user_id,
        token_type:TokenType.RefreshToken
      },
      privateKey:process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options:{
        expiresIn: process.env.Refresh_Token_Exp
      }
    })
  }
  private signAccessAndRefreshToken(user_id:string){
    return Promise.all([
      this.SignAccessToken(user_id),
      this.SignRefrehToken(user_id)
    ])
  }
  private signForgotPasswordToken(user_id:string){
    return signToken({
      payload:{
        user_id,
        token_type:TokenType.ForgotPasswordToken
      },
      privateKey:process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options:{
        expiresIn: process.env.Forgot_Password_Token_Exp
      }
    })
  }
  async register(payload:registerReqBody){
    const user_id = new ObjectId()
    const email_verify_token = await this.SignEmailVerifyToken(user_id.toString())
    await databaseService.users.insertOne(
      new User ({
        ...payload,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: await hassPassword(payload.password)
        
      })
    )
    
      const [access_token,refresh_token]= await this.signAccessAndRefreshToken(user_id.toString())
      await databaseService.refreshTokens.insertOne(new RefreshToken({user_id: new ObjectId(user_id),token:refresh_token}))
      console.log("email_verify_token ở dòng register",email_verify_token)
    return {
      access_token,
      refresh_token
    }

  }
  async checkEmailExit(email: string){
    const user = await databaseService.users.findOne({email})
    return Boolean(user)

  }
  async login(user_id:string){
    // console.log(user_id)
   const [access_token,refresh_token]= await this.signAccessAndRefreshToken(user_id)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({user_id: new ObjectId(user_id),token:refresh_token})
    )
    return {
      access_token,
      refresh_token
    }
  }
  async logout(refresh_token:string){
    const result = await databaseService.refreshTokens.deleteOne({token:refresh_token})
   
  
    return userMessage.LOGOUT_SUCCESS
  }
  async verifyEmail(user_id:string){
    
    const [token] = await Promise.all([
     this.signAccessAndRefreshToken(user_id),
     await databaseService.users.updateOne(
      {_id: new ObjectId(user_id)},
      {$set: {
        email_verify_token: "",
        verify: UserVerifyStatus.Verified,
        // updated_at: new Date()
      },
      $currentDate: {
        updated_at: true
      }
    }
    )
    ])
     const [access_token,refresh_token] = token
    return {
      access_token,
      refresh_token
    }
  }
  async resendVerifyEmail(user_id:string){
    const email_verify_token = await this.SignEmailVerifyToken(user_id)
    console.log("resend-email_verify_token",email_verify_token)
    await databaseService.users.updateOne(
      {_id: new ObjectId(user_id)},
      [{$set: {
        email_verify_token,
        updated_at:"$$NOW"
      },
    }]
    )
    return {
     message: userMessage.RESEND_VERIFY_EMAIL_SUCCESS,
    }
  }
async forgotPassword(user_id:string){
  const forgot_password_token = await this.signForgotPasswordToken(user_id)
  await databaseService.users.updateOne(
    {_id: new ObjectId(user_id)},
    {$set: {
      forgot_password_token,
      updated_at: new Date()
    }}
  )
  console.log("forgot_password_token",forgot_password_token)
  return {
    message: userMessage.FORGOT_PASSWORD_SUCCESS,
    forgot_password_token
  }
}
async resetPassword(user_id:string,password:string){
  await databaseService.users.updateOne(
    {_id: new ObjectId(user_id)},
    {
      $set: {
        password: await hassPassword(password),
        forgot_password_token: "",
        updated_at: new Date()
      }
    }
    
  )
  return {
    message: userMessage.RESET_PASSWORD_SUCCESS
  }
}
async getMe(user_id:string){
  const user = await databaseService.users.findOne({_id: new ObjectId(user_id)},
  {
    projection:{
      password:0,
      email_verify_token:0,
      forgot_password_token:0,
    }
  }
)
  if(!user) {
    throw new Error(userMessage.USER_NOT_FOUND)
  }
  return user
}
}
const userService = new UserService
export default userService