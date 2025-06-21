import { NextFunction, Request,Response } from "express";
import { registerBody } from "../model/request/user.request";
import { ParamsDictionary } from "express-serve-static-core";
import userService from "../services/users.service";

export const loginController = (req:Request,res:Response)=>{
  const user = req.user
  const {user_id}= user


}
export const registerController = async(req:Request<ParamsDictionary, any, registerBody>,res:Response,next:NextFunction)=>{

    const result = await userService.register(req.body)
    res.status(200).json({
      message:"Register Success",
      result
    })
 

}