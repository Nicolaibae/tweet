import { Router } from "express";
import { registerController } from "../controllers/users.controller";
import { loginValidator, RegisterValidator } from "../middleware/users.middlewares";
import {  wrapRequestHandler } from "../utils/handler";


const usersRouter = Router()
usersRouter.post("/register",RegisterValidator,wrapRequestHandler(registerController))
usersRouter.post("/login",loginValidator,wrapRequestHandler(registerController))


export default usersRouter