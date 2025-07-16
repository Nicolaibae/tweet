"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
const errors_1 = require("../model/errors");
const httpStatus_1 = __importDefault(require("../constants/httpStatus"));
const validate = (validation) => {
    return async (req, res, next) => {
        await validation.run(req);
        const errors = (0, express_validator_1.validationResult)(req);
        // không có lỗi thì next
        if (errors.isEmpty()) {
            return next();
        }
        const errorObj = errors.mapped();
        const entityError = new errors_1.EntityError({ errors: {} });
        for (const key in errorObj) {
            const { msg } = errorObj[key];
            if (msg instanceof errors_1.ErrorWithStatus && msg.status !== httpStatus_1.default.unprocessable_entity) { //
                return next(msg);
            }
            entityError.errors[key] = errorObj[key];
        }
        next(entityError);
    };
    // khác lỗi 422 sẽ xử lí như bthg còn là 422 sẽ trả lỗi ra như dòng 25
};
exports.validate = validate;
