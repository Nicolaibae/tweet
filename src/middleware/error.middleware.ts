import { NextFunction, Request,Response } from "express";
import httpStatus from "../constants/httpStatus";
import { ErrorWithStatus } from "../model/errors";

export const defaultErrorHandler = (  err:any, req:Request, res:Response, next:NextFunction) => {
  if(err instanceof ErrorWithStatus){
    return res.status(err.status).json(err)
  }
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, {enumerable: true})
  })
res.status(httpStatus.interval_server_error).json({
  mesage:err.message,
  errorInfor:err.mesage
})

}

