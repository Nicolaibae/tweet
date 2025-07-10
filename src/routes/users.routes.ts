import { Router } from "express";
import { emailverifyController, followController, forgotPasswordController, GetMeController, getProfileController, loginController, logoutController, registerController, resendVerifyEmailController, resetPasswordController, updatemeController, verifyForgotPasswordController } from "../controllers/users.controller";
import { accessTokenValidator, EmailverifyTokenValidator, followValidator, forgotPasswordValidator, loginValidator, refreshTokenValidator, RegisterValidator, ResetPasswordValidator, updateMeValidator, verifiedUserValidator, VerifyforgotPasswordValidator } from "../middleware/users.middlewares";
import { wrapRequestHandler } from "../utils/handler";
import { filterMiddleware } from "../middleware/common.middleware";
import { updateMeReqBody } from "../model/request/user.request";


const usersRouter = Router()
/** login
 * path: /api/v1/users/login
 * method: POST
 * body: {email:string,password:string}
 * response: {message:string,result:{access_token:string,refresh_token:string}}
 */

usersRouter.post("/login", loginValidator, wrapRequestHandler(loginController))
/** 
 * register 
 * path: /api/v1/users/register
 * method: POST 
 * body: {email:string,password:string,full_name:string,date_of_birth:Date}
 * response: {message:string,result:{access_token:string,refresh_token:string}}
 */
usersRouter.post("/register", RegisterValidator, wrapRequestHandler(registerController))
/** 
 * logout 
 * path: /api/v1/users/logout
 * method: POST 
 * 
 */
usersRouter.post("/logout", accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
/**
  * verify-email when client click on the link in the email
  * path: /api/users/verify-email
  * method: POST
  * 
 */
usersRouter.post("/verify-email", EmailverifyTokenValidator, wrapRequestHandler(emailverifyController))
/**
  * resend verify email
  * when user click on the resend verify email button
  * path: /api/users/resend-verify-email
  * method: POST
  * 
 */
usersRouter.post("/resend-verify-email", accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))
/**
  * forgot password
  * path: /api/users/forgot-password
  * method: POST
  * body: {email:string}
 */
usersRouter.post("/forgot-password", forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))
/**
 *  verify forgot password
 *  path: /api/users/verify-forgot-password
 * method: POST
 *  body: {email:string,forgot_password_token:string,password:string,confirm_password:string}
 */
usersRouter.post("/verify-forgot-password", VerifyforgotPasswordValidator, wrapRequestHandler(verifyForgotPasswordController))
/**
 * reset password 
 * path: /api/users/reset-password
 * method: POST
 * body: {email:string,forgot_password_token:string,password:string,confirm_password:string}
 */
usersRouter.post("/reset-password", ResetPasswordValidator, wrapRequestHandler(resetPasswordController))
/**
 * get user info
 * path: /api/users/me
 * method: GET
 */
usersRouter.get("/me", accessTokenValidator, wrapRequestHandler(GetMeController))
/**
 * update user profile
 * path: /api/users/me
 * method: PATCH
 * 
 */
usersRouter.patch("/me", accessTokenValidator,verifiedUserValidator,updateMeValidator,filterMiddleware<updateMeReqBody>(['name','date_of_birth','bio','website','location','avatar','username', 'cover_photo']), wrapRequestHandler(updatemeController))
/**
 * get user profile
 *  path: /api/users/:username
 * method: GET
 * params: {username:string}
 * 
 */
usersRouter.get("/:username",wrapRequestHandler(getProfileController))

/**
 * follow user
 *  path: /api/users/follow
 * method: POST
 * 
 * 
 */
usersRouter.post("/follow", accessTokenValidator,verifiedUserValidator,followValidator, wrapRequestHandler(followController))



export default usersRouter