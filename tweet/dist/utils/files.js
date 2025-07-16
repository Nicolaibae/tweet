"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNameFromFullname = exports.handleUploadSingleImage = exports.initFolder = void 0;
const fs_1 = __importDefault(require("fs"));
const formidable_1 = require("formidable");
const dir_1 = require("../constants/dir");
const initFolder = () => {
    if (!fs_1.default.existsSync(dir_1.UPLOAD_IMAGE_TEMP_DIR)) {
        fs_1.default.mkdirSync(dir_1.UPLOAD_IMAGE_TEMP_DIR, {
            recursive: true // mục đích tạo folder cha
        });
    }
};
exports.initFolder = initFolder;
const handleUploadSingleImage = async (req) => {
    const form = (0, formidable_1.formidable)({
        uploadDir: dir_1.UPLOAD_IMAGE_TEMP_DIR,
        maxFiles: 1,
        keepExtensions: true,
        maxFileSize: 300 * 1024 * 1024, // 300kb
        filter: function ({ name, originalFilename, mimetype }) {
            const valid = name === 'image' && Boolean(mimetype?.includes('image/'));
            if (!valid) {
                form.emit('error', new Error('file type is not valid'));
            }
            return valid;
        }
    });
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                return reject(err);
            }
            if (!Boolean(files.image)) {
                return reject(new Error('File is not empty'));
            }
            resolve(files.image[0]);
        });
    });
};
exports.handleUploadSingleImage = handleUploadSingleImage;
const getNameFromFullname = (fullname) => {
    const namearr = fullname.split('.');
    namearr.pop();
    return namearr.join('');
};
exports.getNameFromFullname = getNameFromFullname;
