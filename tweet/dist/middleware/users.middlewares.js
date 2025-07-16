"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordValidator = exports.unfollowValidator = exports.followValidator = exports.updateMeValidator = exports.verifiedUserValidator = exports.ResetPasswordValidator = exports.VerifyforgotPasswordValidator = exports.forgotPasswordValidator = exports.EmailverifyTokenValidator = exports.refreshTokenValidator = exports.accessTokenValidator = exports.RegisterValidator = exports.loginValidator = void 0;
const express_validator_1 = require("express-validator");
const validation_1 = require("../utils/validation");
const users_service_1 = __importDefault(require("../services/users.service"));
const message_1 = require("../constants/message");
const database_service_1 = __importDefault(require("../services/database.service"));
const bycrypt_1 = require("../utils/bycrypt");
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../model/errors");
const httpStatus_1 = __importDefault(require("../constants/httpStatus"));
const jsonwebtoken_1 = require("jsonwebtoken");
const mongodb_1 = require("mongodb");
const enum_1 = require("../constants/enum");
const regex_1 = require("../constants/regex");
const passwordSchema = {
    notEmpty: {
        errorMessage: message_1.userMessage.PASSWORD_IS_REQUIRED
    },
    isLength: {
        options: {
            min: 6,
            max: 30
        },
        errorMessage: message_1.userMessage.PASSWORD_LENGTH
    },
    trim: true,
    isStrongPassword: {
        options: {
            minLength: 6,
            minSymbols: 1,
            minUppercase: 1,
            minNumbers: 1
        },
        errorMessage: message_1.userMessage.PASSWORD_MUST_BE_STRONG
    }
};
const confirm_password_Schema = {
    notEmpty: {
        errorMessage: message_1.userMessage.CONFIRM_PASSWORD_IS_REQUIRED
    },
    isLength: {
        options: {
            min: 6,
            max: 30
        },
        errorMessage: message_1.userMessage.CONFIRM_PASSWORD_LENGTH
    },
    trim: true,
    isStrongPassword: {
        options: {
            minLength: 6,
            minSymbols: 1,
            minUppercase: 1,
            minNumbers: 1
        },
        errorMessage: message_1.userMessage.CONFIRM_PASSWORD_MUST_BE_STRONG
    },
    custom: {
        options: (value, { req }) => {
            if (value !== req.body.password) {
                throw new Error(message_1.userMessage.CONFIRM_PASSWORD_NOT_MATCH);
            }
            return true;
        }
    }
};
const forgot_password_token_Schema = {
    trim: true,
    custom: {
        options: async (value, { req }) => {
            if (!value) {
                throw new errors_1.ErrorWithStatus({
                    message: message_1.userMessage.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
                    status: httpStatus_1.default.UNAUTHORIZED
                });
            }
            try {
                const decoded_forgot_password_token = await (0, jwt_1.verifyToken)(value, process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN);
                const { user_id } = decoded_forgot_password_token;
                const user = await database_service_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) });
                if (user === null) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.userMessage.USER_NOT_FOUND,
                        status: httpStatus_1.default.not_found
                    });
                }
                if (user.forgot_password_token !== value) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.userMessage.INVALID_FORGOT_PASSWORD_TOKEN,
                        status: httpStatus_1.default.UNAUTHORIZED
                    });
                }
                req.decoded_forgot_password_token = decoded_forgot_password_token;
            }
            catch (error) {
                if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
                    throw new errors_1.ErrorWithStatus({
                        message: error.message,
                        status: httpStatus_1.default.UNAUTHORIZED
                    });
                }
                throw error;
            }
            return true;
        }
    }
};
const nameSchema = {
    notEmpty: {
        errorMessage: message_1.userMessage.NAME_IS_REQUIRED
    },
    isString: {
        errorMessage: message_1.userMessage.NAME_MUST_BE_STRING
    },
    isLength: {
        options: {
            min: 2,
            max: 30
        },
        errorMessage: message_1.userMessage.NAME_LENGTH
    },
    trim: true,
    errorMessage: "vui lòng điền name"
};
const date_of_birth_Schema = {
    isISO8601: {
        options: {
            strict: true,
            strictSeparator: true
        },
        errorMessage: message_1.userMessage.DATE_OF_BIRTH_IS_ISO8601
    }
};
const userIdSchema = {
    custom: {
        options: async (value, { req }) => {
            if (!mongodb_1.ObjectId.isValid(value)) {
                throw new errors_1.ErrorWithStatus({ message: message_1.userMessage.INVALID_USER_ID, status: httpStatus_1.default.not_found });
            }
            const followed_user = await database_service_1.default.users.findOne({ _id: new mongodb_1.ObjectId(value) });
            if (followed_user === null) {
                throw new errors_1.ErrorWithStatus({ message: message_1.userMessage.USER_NOT_FOUND, status: httpStatus_1.default.not_found });
            }
        }
    }
};
exports.loginValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    email: {
        notEmpty: {
            errorMessage: message_1.userMessage.EMAIL_INVALID
        },
        isEmail: true,
        trim: true,
        isString: true,
        custom: {
            options: async (value, { req }) => {
                console.log("value", value);
                const user = await database_service_1.default.users.findOne({ email: value });
                if (!user) {
                    throw new Error(message_1.userMessage.Email_OR_PASSWORD_INCORRECT);
                }
                const comparePass = await (0, bycrypt_1.comparePassword)(req.body.password, user.password);
                if (!comparePass) {
                    throw new Error(message_1.userMessage.Email_OR_PASSWORD_INCORRECT);
                }
                req.user = user;
                // console.log("user",req.user)
                // // gán user vào req.user để sử dụng trong controller 
                return true;
            }
        },
    },
    password: {
        notEmpty: {
            errorMessage: message_1.userMessage.PASSWORD_IS_REQUIRED
        },
        isLength: {
            options: {
                min: 6,
                max: 30
            },
            errorMessage: message_1.userMessage.PASSWORD_LENGTH
        },
        trim: true,
        isStrongPassword: {
            options: {
                minLength: 6,
                minSymbols: 1,
                minUppercase: 1,
                minNumbers: 1
            },
            errorMessage: message_1.userMessage.PASSWORD_MUST_BE_STRONG
        }
    },
}, ["body"]));
exports.RegisterValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    name: {
        notEmpty: {
            errorMessage: message_1.userMessage.NAME_IS_REQUIRED
        },
        isString: {
            errorMessage: message_1.userMessage.NAME_MUST_BE_STRING
        },
        isLength: {
            options: {
                min: 2,
                max: 30
            },
            errorMessage: message_1.userMessage.NAME_LENGTH
        },
        trim: true,
        errorMessage: "vui lòng điền name"
    },
    email: {
        notEmpty: {
            errorMessage: message_1.userMessage.EMAIL_INVALID
        },
        isEmail: true,
        trim: true,
        isString: true,
        custom: {
            options: async (value) => {
                const result = await users_service_1.default.checkEmailExit(value);
                if (result) {
                    throw new Error(message_1.userMessage.EMAIL_ALREADY_EXISTS);
                }
                return true;
            }
        },
    },
    password: passwordSchema,
    confirm_password: confirm_password_Schema,
    date_of_birth: {
        isISO8601: {
            options: {
                strict: true,
                strictSeparator: true
            },
            errorMessage: message_1.userMessage.DATE_OF_BIRTH_IS_ISO8601
        }
    }
}, ["body"]));
exports.accessTokenValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    Authorization: {
        custom: {
            options: async (value, { req }) => {
                const access_token = (value || "").split(" ")[1];
                if (!access_token) {
                    throw new errors_1.ErrorWithStatus({ message: message_1.userMessage.ACCESS_TOKEN_IS_REQUIRED, status: httpStatus_1.default.UNAUTHORIZED });
                }
                try {
                    const decoded_authorization = await (0, jwt_1.verifyToken)(access_token, process.env.JWT_SECRET_ACCESS_TOKEN);
                    req.decoded_authorization = decoded_authorization;
                }
                catch (error) {
                    throw new errors_1.ErrorWithStatus({
                        message: error.message,
                        status: httpStatus_1.default.UNAUTHORIZED
                    });
                }
                return true;
            }
        }
    }
}, ["headers"]));
exports.refreshTokenValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    refresh_token: {
        trim: true,
        custom: {
            options: async (value, { req }) => {
                if (!value) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.userMessage.REFRESH_TOKEN_IS_REQUIRED,
                        status: httpStatus_1.default.UNAUTHORIZED
                    });
                }
                try {
                    const [decoded_refresh_token, refresh_token] = await Promise.all([
                        (0, jwt_1.verifyToken)(value, process.env.JWT_SECRET_REFRESH_TOKEN),
                        database_service_1.default.refreshTokens.findOne({ token: value })
                    ]);
                    if (!refresh_token) {
                        throw new errors_1.ErrorWithStatus({
                            message: message_1.userMessage.USED_REFRESH_TOKEN_OR_DOES_NOT_EXIST,
                            status: httpStatus_1.default.UNAUTHORIZED
                        });
                    }
                    ;
                    req.decoded_refresh_token = decoded_refresh_token;
                }
                catch (error) {
                    if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
                        throw new errors_1.ErrorWithStatus({
                            message: error.message,
                            status: httpStatus_1.default.UNAUTHORIZED
                        });
                    }
                    throw error;
                }
                return true;
            }
        }
    }
}, ["body"]));
exports.EmailverifyTokenValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    email_verify_token: {
        trim: true,
        custom: {
            options: async (value, { req }) => {
                if (!value) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.userMessage.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                        status: httpStatus_1.default.UNAUTHORIZED
                    });
                }
                try {
                    const decoded_email_verify_token = await (0, jwt_1.verifyToken)(value, process.env.JWT_SECRET_EMAIL_VERIFI_TOKEN);
                    req.decoded_email_verify_token = decoded_email_verify_token;
                }
                catch (error) {
                    if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
                        throw new errors_1.ErrorWithStatus({
                            message: error.message,
                            status: httpStatus_1.default.UNAUTHORIZED
                        });
                    }
                    throw error;
                }
                return true;
            }
        }
    }
}, ["body"]));
exports.forgotPasswordValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    email: {
        notEmpty: {
            errorMessage: message_1.userMessage.EMAIL_INVALID
        },
        isEmail: true,
        trim: true,
        isString: true,
        custom: {
            options: async (value, { req }) => {
                console.log("value", value);
                const user = await database_service_1.default.users.findOne({ email: value });
                if (!user) {
                    throw new Error(message_1.userMessage.USER_NOT_FOUND);
                }
                req.user = user;
                return true;
            }
        },
    }
}, ["body"]));
exports.VerifyforgotPasswordValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    forgot_password_token: forgot_password_token_Schema
}, ["body"]));
exports.ResetPasswordValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    password: passwordSchema,
    confirm_password: confirm_password_Schema,
    forgot_password_token: forgot_password_token_Schema
}));
const verifiedUserValidator = (req, res, next) => {
    const { verify } = req.decoded_authorization;
    if (verify !== enum_1.UserVerifyStatus.Verified) {
        return next(new errors_1.ErrorWithStatus({
            message: message_1.userMessage.USER_NOT_VERIFIED,
            status: httpStatus_1.default.FORBIDDEN
        }));
    }
    next();
};
exports.verifiedUserValidator = verifiedUserValidator;
exports.updateMeValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    name: {
        ...nameSchema,
        optional: true,
        notEmpty: undefined // nếu không có name thì không cần kiểm tra
    },
    date_of_birth: {
        ...date_of_birth_Schema,
        optional: true, // nếu không có date_of_birth thì không cần kiểm tra
        notEmpty: undefined // nếu không có date_of_birth thì không cần kiểm tra
    },
    bio: {
        optional: true, // nếu không có bio thì không cần kiểm tra
        isString: {
            errorMessage: message_1.userMessage.BIO_MUST_BE_STRING
        },
        trim: true,
        isLength: {
            options: {
                min: 0, // không bắt buộc
                max: 200
            },
            errorMessage: message_1.userMessage.BIO_LENGTH
        }
    },
    location: {
        optional: true, // nếu không có bio thì không cần kiểm tra
        isString: {
            errorMessage: message_1.userMessage.LOCATION_MUST_BE_STRING
        },
        trim: true,
        isLength: {
            options: {
                min: 0, // không bắt buộc
                max: 200
            },
            errorMessage: message_1.userMessage.LOCATION_LENGTH
        }
    },
    webstie: {
        optional: true, // nếu không có bio thì không cần kiểm tra
        isString: {
            errorMessage: message_1.userMessage.WEBSITE_MUST_BE_STRING
        },
        trim: true,
        isLength: {
            options: {
                min: 0, // không bắt buộc
                max: 200
            },
            errorMessage: message_1.userMessage.WEBSITE_LENGTH
        }
    },
    username: {
        optional: true, // nếu không có bio thì không cần kiểm tra
        isString: {
            errorMessage: message_1.userMessage.USERNAME_MUST_BE_STRING
        },
        trim: true,
        custom: {
            options: async (value, { req }) => {
                if (!regex_1.REGEX_USERNAME.test(value)) {
                    throw Error(message_1.userMessage.USERNAME_INVALID);
                }
                const user = await database_service_1.default.users.findOne({ username: value });
                // nếu tồn tại user name trong DB k cho phép update
                if (user) {
                    throw Error(message_1.userMessage.USERNAME_EXISTED);
                }
            }
        }
    },
    avatar: {
        optional: true, // nếu không có bio thì không cần kiểm tra
        isString: {
            errorMessage: message_1.userMessage.AVATAR_MUST_BE_STRING
        },
        trim: true,
        isLength: {
            options: {
                min: 0, // không bắt buộc
                max: 400
            },
            errorMessage: message_1.userMessage.AVATAR_LENGTH
        }
    },
    cover_photo: {
        optional: true, // nếu không có bio thì không cần kiểm tra
        isString: {
            errorMessage: message_1.userMessage.USERNAME_MUST_BE_STRING
        },
        trim: true,
        isLength: {
            options: {
                min: 0, // không bắt buộc
                max: 400
            },
            errorMessage: message_1.userMessage.USERNAME_LENGTH
        }
    }
}, ["body"]));
exports.followValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    followed_user_id: userIdSchema
}));
exports.unfollowValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    user_id: userIdSchema
}, ['params']));
exports.changePasswordValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    old_password: {
        ...passwordSchema,
        custom: {
            options: async (value, { req }) => {
                const { user_id } = req.decoded_authorization;
                const user = await database_service_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) });
                if (!user) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.userMessage.USER_NOT_FOUND,
                        status: httpStatus_1.default.not_found
                    });
                }
                const { password } = user;
                const isMatch = await (0, bycrypt_1.hassPassword)(value) === password;
                if (!isMatch) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.userMessage.OLD_PASSWORD_NOT_MATCH,
                        status: httpStatus_1.default.UNAUTHORIZED
                    });
                }
            }
        }
    },
    new_password: passwordSchema,
    confirm_new_password: confirm_password_Schema
}));
