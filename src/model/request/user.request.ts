import { JwtPayload } from "jsonwebtoken";
import { TokenType } from "../../constants/enum";
import e from "express";

export interface registerReqBody{
  name:string,
  email:string,
  password:string,
  confirm_password:string,
  date_of_birth:string

}
export interface loginReqBody{
  email:string,
  password:string
}
export interface logoutReqBody{
  refresh_token:string
}
export interface Tokenpayload extends JwtPayload{
  user_id:string,
  token_type: TokenType
}
export interface VerifyEmailReqBody{
  email_verify_token:string
}
export interface forgotPasswordReqBody{
  email:string  
}
export interface VerifyForgotPasswordReqBody{
  forgot_password_token:string,}