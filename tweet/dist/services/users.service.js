"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_service_1 = __importDefault(require("./database.service"));
const User_schema_1 = __importDefault(require("../model/schemas/User.schema"));
const bycrypt_1 = require("../utils/bycrypt");
const jwt_1 = require("../utils/jwt");
const enum_1 = require("../constants/enum");
const mongodb_1 = require("mongodb");
const RefreshToken_schema_1 = __importDefault(require("../model/schemas/RefreshToken.schema"));
const dotenv_1 = require("dotenv");
const message_1 = require("../constants/message");
const errors_1 = require("../model/errors");
const Follower_schema_1 = __importDefault(require("../model/schemas/Follower.schema"));
const axios_1 = __importDefault(require("axios"));
const httpStatus_1 = __importDefault(require("../constants/httpStatus"));
(0, dotenv_1.config)();
class UserService {
    SignAccessToken({ user_id, verify }) {
        return (0, jwt_1.signToken)({
            payload: {
                user_id,
                token_type: enum_1.TokenType.AccessToken,
                verify: verify || enum_1.UserVerifyStatus.Unverified // nếu không có verify thì mặc định là Unverified
            },
            privateKey: process.env.JWT_SECRET_ACCESS_TOKEN,
            options: {
                expiresIn: process.env.Access_Token_Exp
            }
        });
    }
    SignEmailVerifyToken({ user_id, verify }) {
        return (0, jwt_1.signToken)({
            payload: {
                user_id,
                token_type: enum_1.TokenType.EmailVerifyToken,
                verify: verify || enum_1.UserVerifyStatus.Unverified // nếu không có verify thì mặc định là Unverified
            },
            privateKey: process.env.JWT_SECRET_EMAIL_VERIFI_TOKEN,
            options: {
                expiresIn: process.env.Email_Verify_Token_Exp
            }
        });
    }
    SignRefrehToken({ user_id, verify }) {
        return (0, jwt_1.signToken)({
            payload: {
                user_id,
                token_type: enum_1.TokenType.RefreshToken,
                verify: verify || enum_1.UserVerifyStatus.Unverified // nếu không có verify thì mặc định là Unverified
            },
            privateKey: process.env.JWT_SECRET_REFRESH_TOKEN,
            options: {
                expiresIn: process.env.Refresh_Token_Exp
            }
        });
    }
    signAccessAndRefreshToken({ user_id, verify }) {
        return Promise.all([
            this.SignAccessToken({ user_id, verify }),
            this.SignRefrehToken({ user_id, verify })
        ]);
    }
    signForgotPasswordToken({ user_id, verify }) {
        return (0, jwt_1.signToken)({
            payload: {
                user_id,
                token_type: enum_1.TokenType.ForgotPasswordToken,
                verify: verify || enum_1.UserVerifyStatus.Unverified // nếu không có verify thì mặc định là Unverified
            },
            privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
            options: {
                expiresIn: process.env.Forgot_Password_Token_Exp
            }
        });
    }
    async register(payload) {
        const user_id = new mongodb_1.ObjectId();
        const email_verify_token = await this.SignEmailVerifyToken({ user_id: user_id.toString(), verify: enum_1.UserVerifyStatus.Unverified });
        await database_service_1.default.users.insertOne(new User_schema_1.default({
            ...payload,
            _id: user_id,
            email_verify_token,
            username: `user_${user_id.toString()}`,
            date_of_birth: new Date(payload.date_of_birth),
            password: await (0, bycrypt_1.hassPassword)(payload.password)
        }));
        const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id: user_id.toString(), verify: enum_1.UserVerifyStatus.Unverified });
        await database_service_1.default.refreshTokens.insertOne(new RefreshToken_schema_1.default({ user_id: new mongodb_1.ObjectId(user_id), token: refresh_token }));
        console.log("email_verify_token ở dòng register", email_verify_token);
        return {
            access_token,
            refresh_token
        };
    }
    async checkEmailExit(email) {
        const user = await database_service_1.default.users.findOne({ email });
        return Boolean(user);
    }
    async login({ user_id, verify }) {
        // console.log(user_id)
        const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify });
        await database_service_1.default.refreshTokens.insertOne(new RefreshToken_schema_1.default({ user_id: new mongodb_1.ObjectId(user_id), token: refresh_token }));
        return {
            access_token,
            refresh_token
        };
    }
    async getOauthGoogleToken(code) {
        const body = {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code'
        };
        const { data } = await axios_1.default.post('https://oauth2.googleapis.com/token', body, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        return data;
    }
    async getGoogleUserInfo(access_token, id_token) {
        const { data } = await axios_1.default.get("https://www.googleapis.com/oauth2/v1/userinfo", {
            params: { access_token, alt: "json" },
            headers: {
                Authorization: `Bearer ${id_token}`
            }
        });
        return data;
    }
    async oauth(code) {
        const { id_token, access_token } = await this.getOauthGoogleToken(code);
        const userInfo = await this.getGoogleUserInfo(access_token, id_token);
        if (!userInfo.verified_email) {
            throw new errors_1.ErrorWithStatus({ message: message_1.userMessage.GMAIL_NOT_VERIFY, status: httpStatus_1.default.BAD_REQUEST });
        }
        // kiem tra email dc dki hay chua
        const user = await database_service_1.default.users.findOne({ email: userInfo.email });
        if (user) {
            const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
                user_id: user._id.toString(),
                verify: user.verify
            });
            await database_service_1.default.refreshTokens.insertOne(new RefreshToken_schema_1.default({ user_id: user._id, token: refresh_token }));
            return {
                access_token, refresh_token, newUser: 0, verify: user.verify
            };
        }
        else {
            //không thì đki
            const password = Math.random().toString(36).substring(2, 15);
            const data = await this.register({
                email: userInfo.email,
                name: userInfo.name,
                date_of_birth: new Date().toISOString(),
                password,
                confirm_password: password
            });
            return {
                ...data, newUser: 1, verify: enum_1.UserVerifyStatus.Unverified
            };
        }
        console.log(userInfo);
    }
    async logout(refresh_token) {
        const result = await database_service_1.default.refreshTokens.deleteOne({ token: refresh_token });
        return { message: message_1.userMessage.LOGOUT_SUCCESS, result };
    }
    async verifyEmail(user_id) {
        const [token] = await Promise.all([
            this.signAccessAndRefreshToken({ user_id, verify: enum_1.UserVerifyStatus.Verified }),
            await database_service_1.default.users.updateOne({ _id: new mongodb_1.ObjectId(user_id) }, {
                $set: {
                    email_verify_token: "",
                    verify: enum_1.UserVerifyStatus.Verified,
                    // updated_at: new Date()
                },
                $currentDate: {
                    updated_at: true
                }
            })
        ]);
        const [access_token, refresh_token] = token;
        await database_service_1.default.refreshTokens.insertOne(new RefreshToken_schema_1.default({ user_id: new mongodb_1.ObjectId(user_id), token: refresh_token }));
        return {
            access_token,
            refresh_token
        };
    }
    async resendVerifyEmail(user_id) {
        const email_verify_token = await this.SignEmailVerifyToken({ user_id, verify: enum_1.UserVerifyStatus.Unverified });
        console.log("resend-email_verify_token", email_verify_token);
        await database_service_1.default.users.updateOne({ _id: new mongodb_1.ObjectId(user_id) }, [{
                $set: {
                    email_verify_token,
                    updated_at: "$$NOW"
                },
            }]);
        return {
            message: message_1.userMessage.RESEND_VERIFY_EMAIL_SUCCESS,
        };
    }
    async forgotPassword({ user_id, verify }) {
        const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify });
        await database_service_1.default.users.updateOne({ _id: new mongodb_1.ObjectId(user_id) }, {
            $set: {
                forgot_password_token,
                updated_at: new Date()
            }
        });
        console.log("forgot_password_token", forgot_password_token);
        return {
            message: message_1.userMessage.FORGOT_PASSWORD_SUCCESS,
            forgot_password_token
        };
    }
    async resetPassword(user_id, password) {
        await database_service_1.default.users.updateOne({ _id: new mongodb_1.ObjectId(user_id) }, {
            $set: {
                password: await (0, bycrypt_1.hassPassword)(password),
                forgot_password_token: "",
                updated_at: new Date()
            }
        });
        return {
            message: message_1.userMessage.RESET_PASSWORD_SUCCESS
        };
    }
    async getMe(user_id) {
        const user = await database_service_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) }, {
            projection: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
            }
        });
        if (!user) {
            throw new Error(message_1.userMessage.USER_NOT_FOUND);
        }
        return user;
    }
    async getProfile(username) {
        const user = await database_service_1.default.users.findOne({ username }, {
            projection: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                verify: 0,
                created_at: 0,
                updated_at: 0,
            }
        });
        if (user === null) {
            throw new errors_1.ErrorWithStatus({
                message: message_1.userMessage.USER_NOT_FOUND,
                status: 404
            });
        }
        return user;
    }
    async updateMe(user_id, payload) {
        const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload;
        const user = await database_service_1.default.users.findOneAndUpdate({
            _id: new mongodb_1.ObjectId(user_id)
        }, {
            $set: {
                ..._payload,
                updated_at: new Date()
            }
        }, {
            returnDocument: "after",
            projection: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
            }
        });
        return user;
    }
    async follow(user_id, followed_user_id) {
        const follower = database_service_1.default.followers.findOne({
            user_id: new mongodb_1.ObjectId(user_id),
            followed_user_id: new mongodb_1.ObjectId(followed_user_id)
        });
        if (follower === null) {
            await database_service_1.default.followers.insertOne(new Follower_schema_1.default({
                user_id: new mongodb_1.ObjectId(user_id),
                followed_user_id: new mongodb_1.ObjectId(followed_user_id)
            }));
            return {
                message: message_1.userMessage.FOLLOW_SUCCESS,
            };
        }
        return { message: message_1.userMessage.FOLLOWED };
    }
    async unfollow(user_id, followed_user_id) {
        const follower = database_service_1.default.followers.findOne({
            user_id: new mongodb_1.ObjectId(user_id),
            followed_user_id: new mongodb_1.ObjectId(followed_user_id)
        });
        if (follower === null) {
            return {
                message: message_1.userMessage.ALREADY_UNFOLLOWED,
            };
        }
        await database_service_1.default.followers.deleteOne({
            user_id: new mongodb_1.ObjectId(user_id),
            followed_user_id: new mongodb_1.ObjectId(followed_user_id)
        });
        return { message: message_1.userMessage.UNFOLLOWED_SUCCESS };
    }
    async changePassword(user_id, new_password) {
        await database_service_1.default.users.updateOne({
            user_id: new mongodb_1.ObjectId(user_id)
        }, {
            $set: {
                password: await (0, bycrypt_1.hassPassword)(new_password),
                updated_at: new Date()
            }
        });
        return {
            message: message_1.userMessage.CHANGE_PASSWORD_SUCCESS
        };
    }
}
const userService = new UserService;
exports.default = userService;
