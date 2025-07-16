"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSingleImageController = void 0;
const medias_service_1 = __importDefault(require("../services/medias.service"));
const uploadSingleImageController = async (req, res, next) => {
    const result = await medias_service_1.default.handleUploadSingleImage(req);
    return res.json({
        result: result
    });
};
exports.uploadSingleImageController = uploadSingleImageController;
