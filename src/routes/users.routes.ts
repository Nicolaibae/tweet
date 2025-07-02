import { Router } from "express";
import { loginController, logoutController, registerController } from "../controllers/users.controller";
import { accessTokenValidator, loginValidator, refreshTokenValidator, RegisterValidator } from "../middleware/users.middlewares";
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



export default usersRouter