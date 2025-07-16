"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("../controllers/users.controller");
const users_middlewares_1 = require("../middleware/users.middlewares");
const handler_1 = require("../utils/handler");
const common_middleware_1 = require("../middleware/common.middleware");
const usersRouter = (0, express_1.Router)();
/** login
 * path: /api/v1/users/login
 * method: POST
 * body: {email:string,password:string}
 * response: {message:string,result:{access_token:string,refresh_token:string}}
 */
usersRouter.post("/login", users_middlewares_1.loginValidator, (0, handler_1.wrapRequestHandler)(users_controller_1.loginController));
/** Oauth with google
 * path: /oauth/google
 * method: get
 * body: {code:string}
 * response: {message:string,result:{access_token:string,refresh_token:string}}
 */
usersRouter.get("/oauth/google", (0, handler_1.wrapRequestHandler)(users_controller_1.oauthController));
/**
 * register
 * path: /api/v1/users/register
 * method: POST
 * body: {email:string,password:string,full_name:string,date_of_birth:Date}
 * response: {message:string,result:{access_token:string,refresh_token:string}}
 */
usersRouter.post("/register", users_middlewares_1.RegisterValidator, (0, handler_1.wrapRequestHandler)(users_controller_1.registerController));
/**
 * logout
 * path: /api/v1/users/logout
 * method: POST
 *
 */
usersRouter.post("/logout", users_middlewares_1.accessTokenValidator, users_middlewares_1.refreshTokenValidator, (0, handler_1.wrapRequestHandler)(users_controller_1.logoutController));
/**
  * verify-email when client click on the link in the email
  * path: /api/users/verify-email
  * method: POST
  *
 */
usersRouter.post("/verify-email", users_middlewares_1.EmailverifyTokenValidator, (0, handler_1.wrapRequestHandler)(users_controller_1.emailverifyController));
/**
  * resend verify email
  * when user click on the resend verify email button
  * path: /api/users/resend-verify-email
  * method: POST
  *
 */
usersRouter.post("/resend-verify-email", users_middlewares_1.accessTokenValidator, (0, handler_1.wrapRequestHandler)(users_controller_1.resendVerifyEmailController));
/**
  * forgot password
  * path: /api/users/forgot-password
  * method: POST
  * body: {email:string}
 */
usersRouter.post("/forgot-password", users_middlewares_1.forgotPasswordValidator, (0, handler_1.wrapRequestHandler)(users_controller_1.forgotPasswordController));
/**
 *  verify forgot password
 *  path: /api/users/verify-forgot-password
 * method: POST
 *  body: {email:string,forgot_password_token:string,password:string,confirm_password:string}
 */
usersRouter.post("/verify-forgot-password", users_middlewares_1.VerifyforgotPasswordValidator, (0, handler_1.wrapRequestHandler)(users_controller_1.verifyForgotPasswordController));
/**
 * reset password
 * path: /api/users/reset-password
 * method: POST
 * body: {email:string,forgot_password_token:string,password:string,confirm_password:string}
 */
usersRouter.post("/reset-password", users_middlewares_1.ResetPasswordValidator, (0, handler_1.wrapRequestHandler)(users_controller_1.resetPasswordController));
/**
 * get user info
 * path: /api/users/me
 * method: GET
 */
usersRouter.get("/me", users_middlewares_1.accessTokenValidator, (0, handler_1.wrapRequestHandler)(users_controller_1.GetMeController));
/**
 * update user profile
 * path: /api/users/me
 * method: PATCH
 *
 */
usersRouter.patch("/me", users_middlewares_1.accessTokenValidator, users_middlewares_1.verifiedUserValidator, users_middlewares_1.updateMeValidator, (0, common_middleware_1.filterMiddleware)(['name', 'date_of_birth', 'bio', 'website', 'location', 'avatar', 'username', 'cover_photo']), (0, handler_1.wrapRequestHandler)(users_controller_1.updatemeController));
/**
 * get user profile
 *  path: /api/users/:username
 * method: GET
 * params: {username:string}
 *
 */
usersRouter.get("/:username", (0, handler_1.wrapRequestHandler)(users_controller_1.getProfileController));
/**
 * follow user
 *  path: /api/users/follow
 * method: POST
 *
 *
 */
usersRouter.post("/follow", users_middlewares_1.accessTokenValidator, users_middlewares_1.verifiedUserValidator, users_middlewares_1.followValidator, (0, handler_1.wrapRequestHandler)(users_controller_1.followController));
/**
 *  delete follow user
 *
 */
usersRouter.delete("/follow/:user_id", users_middlewares_1.accessTokenValidator, users_middlewares_1.verifiedUserValidator, users_middlewares_1.unfollowValidator, (0, handler_1.wrapRequestHandler)(users_controller_1.unfollowController));
usersRouter.put("/change-password", users_middlewares_1.accessTokenValidator, users_middlewares_1.verifiedUserValidator, users_middlewares_1.changePasswordValidator, (0, handler_1.wrapRequestHandler)(users_controller_1.changePasswordController));
exports.default = usersRouter;
