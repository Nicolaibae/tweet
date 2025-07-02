import { NextFunction, Request,Response } from "express";
import { logoutReqBody, registerBody, Tokenpayload } from "../model/request/user.request";
import { ParamsDictionary } from "express-serve-static-core";
import userService from "../services/users.service";
import User from "../model/schemas/User.schema";
import { ObjectId } from "mongodb";
import { userMessage } from "../constants/message";
import databaseService from "../services/database.service";

export const loginController = async(req:Request,res:Response)=>{
  const user= req.user as User
  const user_id= user._id as ObjectId
  const result = await userService.login(user_id.toString())
   res.json({
    message:userMessage.LOGIN_SUCCESS,
    result
  })

}
export const registerController = async(req:Request<ParamsDictionary, any, registerBody>,res:Response,next:NextFunction)=>{

    const result = await userService.register(req.body)
    
    res.status(200).json({
      message:userMessage.REGISTER_SUCCESS,
      result
    })
 

}
export const logoutController = async(req:Request<ParamsDictionary, any, logoutReqBody>,res:Response)=>{  
  const {refresh_token} = req.body
  const result = await userService.logout(refresh_token)
   res.json({result})

}
export const emailverifyValidator = async(req:Request,res:Response,next:NextFunction)=>{
  const {user_id} = req.decoded_email_verify_token as Tokenpayload
 const user = await databaseService.users.findOne({
  _id: new ObjectId(user_id)
 })
 if(!user){
  return res.status(404).json({
    message: userMessage.USER_NOT_FOUND 
 })
}
// đã verify email rồi mình k báo lỗi, mình sẽ trả về status ok với message là đã verify email
if(user.email_verify_token === ""){
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