
import databaseService from "./database.service"
import User from "../model/schemas/User.schema"
import { hassPassword } from "../utils/bycrypt"
import { signToken } from "../utils/jwt"
import { TokenType, UserVerifyStatus } from "../constants/enum"
import { ObjectId, WithId } from "mongodb"
import RefreshToken from "../model/schemas/RefreshToken.schema"
import { config } from "dotenv"
import { userMessage } from "../constants/message"
import { registerReqBody, updateMeReqBody } from "../model/request/user.request"
import { verify } from "node:crypto"
import { ErrorWithStatus } from "../model/errors"
import Follower from "../model/schemas/Follower.schema"
config()
class UserService {
  private SignAccessToken({ user_id, verify }: { user_id: string, verify: UserVerifyStatus }) {


    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify: verify || UserVerifyStatus.Unverified // nếu không có verify thì mặc định là Unverified
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.Access_Token_Exp
      }
    })
  }
  private SignEmailVerifyToken({ user_id, verify }: { user_id: string, verify: UserVerifyStatus }) {


    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify: verify || UserVerifyStatus.Unverified // nếu không có verify thì mặc định là Unverified
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFI_TOKEN as string,
      options: {
        expiresIn: process.env.Email_Verify_Token_Exp
      }
    })
  }
  private SignRefrehToken({ user_id, verify }: { user_id: string, verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify: verify || UserVerifyStatus.Unverified // nếu không có verify thì mặc định là Unverified
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.Refresh_Token_Exp
      }
    })
  }
  private signAccessAndRefreshToken({ user_id, verify }: { user_id: string, verify: UserVerifyStatus }) {
    return Promise.all([
      this.SignAccessToken({ user_id, verify }),
      this.SignRefrehToken({ user_id, verify })
    ])
  }
  private signForgotPasswordToken({ user_id, verify }: { user_id: string, verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify: verify || UserVerifyStatus.Unverified // nếu không có verify thì mặc định là Unverified
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.Forgot_Password_Token_Exp
      }
    })
  }
  async register(payload: registerReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.SignEmailVerifyToken({ user_id: user_id.toString(), verify: UserVerifyStatus.Unverified })
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        username: `user_${user_id.toString()}`,
        date_of_birth: new Date(payload.date_of_birth),
        password: await hassPassword(payload.password)

      })
    )

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id: user_id.toString(), verify: UserVerifyStatus.Unverified })
    await databaseService.refreshTokens.insertOne(new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token }))
    console.log("email_verify_token ở dòng register", email_verify_token)
    return {
      access_token,
      refresh_token
    }

  }
  async checkEmailExit(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)

  }
  async login({ user_id, verify }: { user_id: string, verify: UserVerifyStatus }) {
    // console.log(user_id)
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify })
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    return {
      access_token,
      refresh_token
    }
  }
  async logout(refresh_token: string) {
    const result = await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return { message: userMessage.LOGOUT_SUCCESS, result }
  }
  async verifyEmail(user_id: string) {

    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified }),
      await databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $set: {
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
    const [access_token, refresh_token] = token
    return {
      access_token,
      refresh_token
    }
  }
  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.SignEmailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified })
    console.log("resend-email_verify_token", email_verify_token)
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      [{
        $set: {
          email_verify_token,
          updated_at: "$$NOW"
        },
      }]
    )
    return {
      message: userMessage.RESEND_VERIFY_EMAIL_SUCCESS,
    }
  }
  async forgotPassword({ user_id, verify }: { user_id: string, verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify })
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token,
          updated_at: new Date()
        }
      }
    )
    console.log("forgot_password_token", forgot_password_token)
    return {
      message: userMessage.FORGOT_PASSWORD_SUCCESS,
      forgot_password_token
    }
  }
  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
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
  async getMe(user_id: string) {
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
        }
      }
    )
    if (!user) {
      throw new Error(userMessage.USER_NOT_FOUND)
    }
    return user
  }
  async getProfile(username: string) {
    const user = await databaseService.users.findOne({ username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0,
        }
      }
    )
    if (user === null) {
      throw new ErrorWithStatus({
        message: userMessage.USER_NOT_FOUND,
        status: 404
      })
    }
    return user
  }
  async updateMe(user_id: string, payload: updateMeReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    const user = await databaseService.users.findOneAndUpdate({
      _id: new ObjectId(user_id)
    },
      {
        $set: {
          ...(_payload as updateMeReqBody & { date_of_birth?: Date }),
          updated_at: new Date()
        }
      },
      {
        returnDocument: "after",
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
        }
      })
    return user
  }
  async follow( user_id: string, followed_user_id:string ) {
    const follower = databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if(follower === null){
       await  databaseService.followers.insertOne(new Follower({
      user_id: new ObjectId(user_id), 
      followed_user_id: new ObjectId(followed_user_id)
    }))
     return {
      message: userMessage.FOLLOW_SUCCESS,
    }
    }
    return {  message: userMessage.FOLLOWED}
  }

}
const userService = new UserService
export default userService