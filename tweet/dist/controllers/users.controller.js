"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordController = exports.unfollowController = exports.followController = exports.getProfileController = exports.updatemeController = exports.GetMeController = exports.resetPasswordController = exports.verifyForgotPasswordController = exports.forgotPasswordController = exports.resendVerifyEmailController = exports.emailverifyController = exports.logoutController = exports.registerController = exports.oauthController = exports.loginController = void 0;
const users_service_1 = __importDefault(require("../services/users.service"));
const mongodb_1 = require("mongodb");
const message_1 = require("../constants/message");
const database_service_1 = __importDefault(require("../services/database.service"));
const httpStatus_1 = __importDefault(require("../constants/httpStatus"));
const enum_1 = require("../constants/enum");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const loginController = async (req, res) => {
    const user = req.user;
    const user_id = user._id;
    const result = await users_service_1.default.login({ user_id: user_id.toString(), verify: user.verify });
    res.json({
        message: message_1.userMessage.LOGIN_SUCCESS,
        result
    });
};
exports.loginController = loginController;
const oauthController = async (req, res) => {
    const { code } = req.query;
    const result = await users_service_1.default.oauth(code);
    const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${result.access_token}&refresh_token=${result.refresh_token}$new_user=${result.newUser}&verify=${result.verify}`;
    return res.redirect(urlRedirect);
};
exports.oauthController = oauthController;
const registerController = async (req, res, next) => {
    const result = await users_service_1.default.register(req.body);
    res.status(200).json({
        message: message_1.userMessage.REGISTER_SUCCESS,
        result
    });
};
exports.registerController = registerController;
const logoutController = async (req, res) => {
    const { refresh_token } = req.body;
    const result = await users_service_1.default.logout(refresh_token);
    res.json({ result });
};
exports.logoutController = logoutController;
const emailverifyController = async (req, res, next) => {
    const { user_id } = req.decoded_email_verify_token;
    // console.log("decode",req.decoded_email_verify_token as Tokenpayload)
    const user = await database_service_1.default.users.findOne({
        _id: new mongodb_1.ObjectId(user_id)
    });
    if (!user) {
        return res.status(404).json({
            message: message_1.userMessage.USER_NOT_FOUND
        });
    }
    // đã verify email rồi mình k báo lỗi, mình sẽ trả về status ok với message là đã verify email
    if (user.email_verify_token === "") {
        return res.status(200).json({
            message: message_1.userMessage.EMAIL_ALREADY_VERIFIED_BEFOR
        });
    }
    const result = await users_service_1.default.verifyEmail(user_id);
    return res.json({
        message: message_1.userMessage.EMAIL_VERIFY_SUCCESS,
        result
    });
};
exports.emailverifyController = emailverifyController;
const resendVerifyEmailController = async (req, res, next) => {
    const { user_id } = req.decoded_authorization;
    const user = await database_service_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) });
    if (!user) {
        return res.status(httpStatus_1.default.not_found).json({
            message: message_1.userMessage.USER_NOT_FOUND
        });
    }
    if (user.verify === enum_1.UserVerifyStatus.Verified) {
        return res.json({
            message: message_1.userMessage.EMAIL_ALREADY_VERIFIED_BEFOR
        });
    }
    const result = await users_service_1.default.resendVerifyEmail(user_id);
    return res.json(result);
};
exports.resendVerifyEmailController = resendVerifyEmailController;
const forgotPasswordController = async (req, res, next) => {
    const { _id, verify } = req.user;
    const result = await users_service_1.default.forgotPassword({ user_id: _id.toString(), verify });
    return res.json(result);
};
exports.forgotPasswordController = forgotPasswordController;
const verifyForgotPasswordController = async (req, res, next) => {
    return res.json({
        message: message_1.userMessage.VERIFY_FORGOT_PASSWORD_SUCCESS
    });
};
exports.verifyForgotPasswordController = verifyForgotPasswordController;
const resetPasswordController = async (req, res, next) => {
    const { user_id } = req.decoded_forgot_password_token;
    const { password } = req.body;
    const result = await users_service_1.default.resetPassword(user_id, password);
    return res.json(result);
};
exports.resetPasswordController = resetPasswordController;
const GetMeController = async (req, res, next) => {
    const { user_id } = req.decoded_authorization;
    const user = await users_service_1.default.getMe(user_id);
    return res.json({
        message: message_1.userMessage.GET_ME_SUCCESS,
        result: user
    });
};
exports.GetMeController = GetMeController;
const updatemeController = async (req, res, next) => {
    const { user_id } = req.decoded_authorization;
    const user = await users_service_1.default.updateMe(user_id, req.body);
    return res.json({
        message: message_1.userMessage.UPDATE_ME_SUCCESS,
        result: user
    });
};
exports.updatemeController = updatemeController;
const getProfileController = async (req, res, next) => {
    const { username } = req.params;
    const user = await users_service_1.default.getProfile(username);
    return res.json({
        message: message_1.userMessage.GET_USER_PROFILE_SUCCESS,
        result: user
    });
};
exports.getProfileController = getProfileController;
const followController = async (req, res, next) => {
    const { user_id } = req.decoded_authorization;
    const { followed_user_id } = req.body;
    const result = await users_service_1.default.follow(user_id, followed_user_id);
    return res.json(result);
};
exports.followController = followController;
const unfollowController = async (req, res, next) => {
    const { user_id } = req.decoded_authorization;
    const { user_id: followed_user_id } = req.params;
    const result = await users_service_1.default.unfollow(user_id, followed_user_id);
    return res.json(result);
};
exports.unfollowController = unfollowController;
const changePasswordController = async (req, res, next) => {
    const { user_id } = req.decoded_authorization;
    const { password } = req.body;
    const result = await users_service_1.default.changePassword(user_id, password);
    return res.json(result);
};
exports.changePasswordController = changePasswordController;
