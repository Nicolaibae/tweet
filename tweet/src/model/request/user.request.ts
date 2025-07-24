import { JwtPayload } from "jsonwebtoken";
import { TokenType, UserVerifyStatus } from "../../constants/enum";
import {ParamsDictionary} from 'express-serve-static-core'

export interface registerReqBody {
  name: string,
  email: string,
  password: string,
  confirm_password: string,
  date_of_birth: string

}
export interface loginReqBody {
  email: string,
  password: string
}
export interface logoutReqBody {
  refresh_token: string
}
export interface Tokenpayload extends JwtPayload {
  user_id: string,
  token_type: TokenType,
  verify:UserVerifyStatus,
  exp:number,
  iat:number
}
export interface VerifyEmailReqBody {
  email_verify_token: string
}
export interface forgotPasswordReqBody {
  email: string
}
export interface VerifyForgotPasswordReqBody {
  forgot_password_token: string,
}
export interface ResetPasswordReqBody {
  password: string,
  confirm_password: string,
  forgot_password_token: string
}
export interface updateMeReqBody {
  name?: string,
  date_of_birth?: string,
  bio?: string,
  avatar?: string,
  cover_photo?: string,
  website?: string,
  location?: string,
  username?: string
}
export interface getUserProfileReqParams extends ParamsDictionary {
  username: string
}
export interface followReqBody {
  followed_user_id: string
}
export interface unfollowReqParam extends ParamsDictionary {
  user_id: string
}
export interface RefreshTokenReqBody {
  refresh_token:string
}
