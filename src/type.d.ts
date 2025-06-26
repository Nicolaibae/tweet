import { Request } from "express";
import User from "./model/schemas/User.schema";
declare module "express"{
  interface Request {
    user?: User
  }
}