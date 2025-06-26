
import databaseService from "./database.service"
import { registerBody } from "../model/request/user.request"
import User from "../model/schemas/User.schema"
import { hassPassword } from "../utils/bycrypt"
import { signToken } from "../utils/jwt"
import { TokenType } from "../constants/enum"
import { ObjectId } from "mongodb"
import RefreshToken from "../model/schemas/RefreshToken.schema"
import { config } from "dotenv"
config()
class UserService{
  private SignAccessToken(user_id:string){
    

    return signToken({
      payload:{
        user_id,
        token_type:TokenType.AccessToken
      },
      options:{
        expiresIn: process.env.Access_Token_Exp
      }
    })
  }
  private SignRefrehToken(user_id:string){
    return signToken({
      payload:{
        user_id,
        token_type:TokenType.RefreshToken
      },
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
  async register(payload:registerBody){
    const result = await databaseService.users.insertOne(
      new User ({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: await hassPassword(payload.password)
        
      })
    )
    const userid = result.insertedId.toString()
      const [access_token,refresh_token]= await this.signAccessAndRefreshToken(userid)
      await databaseService.refreshTokens.insertOne(new RefreshToken({user_id: new ObjectId(userid),token:refresh_token}))
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
    console.log(user_id)
  //  const [access_token,refresh_token]= await this.signAccessAndRefreshToken(user_id)
  //   await databaseService.refreshTokens.insertOne(
  //     new RefreshToken({user_id: new ObjectId(user_id),token:refresh_token})
  //   )
  //   return {
  //     access_token,
  //     refresh_token
  //   }
  }


}
const userService = new UserService
export default userService