"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const medias_controller_1 = require("../controllers/medias.controller");
const handler_1 = require("../utils/handler");
const mediasRouter = (0, express_1.Router)();
mediasRouter.post("/upload-image", (0, handler_1.wrapRequestHandler)(medias_controller_1.uploadSingleImageController));
exports.default = mediasRouter;
