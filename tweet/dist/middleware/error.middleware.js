"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultErrorHandler = void 0;
const httpStatus_1 = __importDefault(require("../constants/httpStatus"));
const errors_1 = require("../model/errors");
const defaultErrorHandler = (err, req, res, next) => {
    if (err instanceof errors_1.ErrorWithStatus) {
        return res.status(err.status).json(err);
    }
    Object.getOwnPropertyNames(err).forEach((key) => {
        Object.defineProperty(err, key, { enumerable: true });
    });
    res.status(httpStatus_1.default.interval_server_error).json({
        mesage: err.message,
        errorInfor: err.mesage
    });
};
exports.defaultErrorHandler = defaultErrorHandler;
