import { NextFunction, Request, Response } from "express";
import { followReqBody, forgotPasswordReqBody, getUserProfileReqParams, loginReqBody, logoutReqBody, registerReqBody, ResetPasswordReqBody, Tokenpayload, unfollowReqParam, updateMeReqBody, VerifyEmailReqBody, VerifyForgotPasswordReqBody } from "../model/request/user.request";
import { ParamsDictionary } from "express-serve-static-core";
import userService from "../services/users.service";
import User from "../model/schemas/User.schema";
import { ObjectId } from "mongodb";
import { userMessage } from "../constants/message";
import databaseService from "../services/database.service";
import httpStatus from "../constants/httpStatus";
import { UserVerifyStatus } from "../constants/enum";
import { config } from "dotenv";

config()

export const loginController = async (req: Request<ParamsDictionary, any, loginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await userService.login({user_id:user_id.toString(),verify:user.verify})
  res.json({
    message: userMessage.LOGIN_SUCCESS,
    result
  })

}
export const oauthController = async (req: Request, res: Response) => {
  const {code} = req.query
  const result = await userService.oauth(code as string)
  const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${result.access_token}&refresh_token=${result.refresh_token}$new_user=${result.newUser}&verify=${result.verify}`
  return res.redirect(urlRedirect)

}
export const registerController = async (req: Request<ParamsDictionary, any, registerReqBody>, res: Response, next: NextFunction) => {

  const result = await userService.register(req.body)

  res.status(200).json({
    message: userMessage.REGISTER_SUCCESS,
    result
  })


}
export const logoutController = async (req: Request<ParamsDictionary, any, logoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await userService.logout(refresh_token)
  res.json({ result })

}
export const emailverifyController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_email_verify_token as Tokenpayload
  // console.log("decode",req.decoded_email_verify_token as Tokenpayload)
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  if (!user) {
    return res.status(404).json({
      message: userMessage.USER_NOT_FOUND
    })
  }
  // đã verify email rồi mình k báo lỗi, mình sẽ trả về status ok với message là đã verify email
  if (user.email_verify_token === "") {
    return res.status(200).json({
      message: userMessage.EMAIL_ALREADY_VERIFIED_BEFOR
    })
  }
  const result = await userService.verifyEmail(user_id)
  return res.json({
    message: userMessage.EMAIL_VERIFY_SUCCESS,
    result
  })
}
export const resendVerifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if( !user) {
    return res.status(httpStatus.not_found).json({
      message: userMessage.USER_NOT_FOUND
    })
  }
  if(user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: userMessage.EMAIL_ALREADY_VERIFIED_BEFOR
    })
  }
  const result = await userService.resendVerifyEmail(user_id)
  return res.json(result)


}
export const forgotPasswordController = async (req: Request<ParamsDictionary, any, forgotPasswordReqBody>, res: Response, next: NextFunction) => {
  const { _id,verify } = req.user as User
 const result = await userService.forgotPassword({user_id:(_id as ObjectId).toString(),verify})
 return res.json(result)
}
export const verifyForgotPasswordController = async (req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>, res: Response, next: NextFunction) => {
  return res.json({
    message: userMessage.VERIFY_FORGOT_PASSWORD_SUCCESS  
  })
}
export const resetPasswordController = async (req: Request<ParamsDictionary, any, ResetPasswordReqBody>, res: Response, next: NextFunction) => {
  const {user_id} = req.decoded_forgot_password_token as Tokenpayload
  const { password} = req.body
 const result= await userService.resetPassword(user_id,password)
 return res.json(result)

}
export const GetMeController = async (req: Request, res: Response, next: NextFunction) => {
  const {user_id} = req.decoded_authorization as Tokenpayload
  const user = await userService.getMe(user_id)
  return res.json({
    message: userMessage.GET_ME_SUCCESS,
    result: user
  })
}
export const updatemeController = async (req: Request<ParamsDictionary, any, updateMeReqBody>, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  const user = await userService.updateMe(user_id, req.body)
  return res.json({
    message: userMessage.UPDATE_ME_SUCCESS,
    result: user
  })
}
export const getProfileController = async (req: Request<{username:string},any,getUserProfileReqParams>, res: Response, next: NextFunction) => {
  const { username } = req.params
  const user = await userService.getProfile(username)
  return res.json({
    message: userMessage.GET_USER_PROFILE_SUCCESS,
    result: user
  })
}
export const followController = async (req: Request<ParamsDictionary, any, followReqBody>, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  const {followed_user_id } = req.body
  const result = await userService.follow(user_id, followed_user_id)
  return res.json(result)

}
export const unfollowController = async (req: Request<unfollowReqParam>, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  const {user_id:followed_user_id } = req.params
  const result = await userService.unfollow(user_id, followed_user_id)
  return res.json(result)

}
export const changePasswordController = async(req: Request<unfollowReqParam>, res: Response, next: NextFunction) => {
  const {user_id} = req.decoded_authorization as Tokenpayload
  const {password} =req.body
  const result = await userService.changePassword(user_id,password)
  return res.json(result)
}


