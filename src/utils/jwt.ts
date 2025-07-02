
import { config } from "dotenv"
import jwt, { SignOptions } from "jsonwebtoken"
import { Tokenpayload } from "../model/request/user.request"
config()

export const signToken = ({payload, privateKey, options={algorithm:"HS256"}}:{
  payload:string| Buffer |object,
  privateKey?:string,
  options?: SignOptions


}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey!, options, (error, token) => {
      if(error){
        reject(error)
      }
      resolve(token as string)
    })
  })
}
export const verifyToken = (token:string, secretKey: string) => {
  return new Promise<Tokenpayload>((resolve, reject) => {
    jwt.verify(token, secretKey, (error, decoded) => {
      if(error){
        reject(error)
      }
      resolve(decoded as Tokenpayload)
    })
  })

}
