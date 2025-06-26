import { NextFunction, Request,Response } from "express";
import { registerBody } from "../model/request/user.request";
import { ParamsDictionary } from "express-serve-static-core";
import userService from "../services/users.service";
import User from "../model/schemas/User.schema";
import { ObjectId } from "mongodb";
import { userMessage } from "../constants/message";

export const loginController = async(req:Request,res:Response)=>{
  const user= req.user as User
  const user_id= user._id as ObjectId
  const result = await userService.login(user_id.toString())
  return res.json({
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