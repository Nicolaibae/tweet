"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const files_1 = require("../utils/files");
const sharp_1 = __importDefault(require("sharp"));
const dir_1 = require("../constants/dir");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("../constants/config");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
class MediasService {
    async handleUploadSingleImage(req) {
        const file = await (0, files_1.handleUploadSingleImage)(req);
        const newName = (0, files_1.getNameFromFullname)(file.newFilename);
        const newFullFilename = `${newName}.jpg`;
        const newPath = path_1.default.resolve(dir_1.UPLOAD_DIR, newFullFilename);
        await (0, sharp_1.default)(file.filepath).jpeg().toFile(newPath);
        fs_1.default.unlinkSync(file.filepath); // delete image in temp
        return config_1.isProduction ? `${process.env.HOST}/medias/${newFullFilename}` : `http://localhost:${process.env.PORT}/medias/${newFullFilename}`;
    }
}
const mediasService = new MediasService();
exports.default = mediasService;
