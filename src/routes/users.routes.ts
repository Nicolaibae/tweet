import { Router } from "express";
import { emailverifyController, emailverifyValidator, loginController, logoutController, registerController, resendVerifyEmailController } from "../controllers/users.controller";
import { accessTokenValidator, EmailverifyTokenValidator, loginValidator, refreshTokenValidator, RegisterValidator } from "../middleware/users.middlewares";
import {  wrapRequestHandler } from "../utils/handler";


const usersRouter = Router()
/** login
 * path: /api/v1/users/login
 * method: POST
 * body: {email:string,password:string}
 * response: {message:string,result:{access_token:string,refresh_token:string}}
 */

usersRouter.post("/login",loginValidator,wrapRequestHandler(loginController))
/** 
 * register 
 * path: /api/v1/users/register
 * method: POST 
 * body: {email:string,password:string,full_name:string,date_of_birth:Date}
 * response: {message:string,result:{access_token:string,refresh_token:string}}
 */
usersRouter.post("/register",RegisterValidator,wrapRequestHandler(registerController))
/** 
 * logout 
 * path: /api/v1/users/logout
 * method: POST 
 * 
 */
usersRouter.post("/logout",accessTokenValidator,refreshTokenValidator,wrapRequestHandler(logoutController))
/**
  * verify-email when client click on the link in the email
  * path: /api/v1/users/verify-email
  * method: POST
  * 
 */
usersRouter.post("/verify-email",EmailverifyTokenValidator,wrapRequestHandler(emailverifyController))
/**
  * resend verify email
  * when user click on the resend verify email button
  * path: /api/v1/users/resend-verify-email
  * method: POST
  * 
 */
usersRouter.post("/resend-verify-email",accessTokenValidator,wrapRequestHandler(resendVerifyEmailController))




export default usersRouter