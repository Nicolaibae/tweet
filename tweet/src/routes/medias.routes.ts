import { Router } from "express";
import { uploadImageController, uploadVideoController } from "../controllers/medias.controller";
import { wrapRequestHandler } from "../utils/handler";
import { accessTokenValidator, verifiedUserValidator } from "../middleware/users.middlewares";
const mediasRouter = Router()

mediasRouter.post("/upload-image",accessTokenValidator,verifiedUserValidator,wrapRequestHandler(uploadImageController))
mediasRouter.post("/upload-video",accessTokenValidator,verifiedUserValidator,wrapRequestHandler(uploadVideoController))
export default mediasRouter