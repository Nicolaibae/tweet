"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enum_1 = require("../../constants/enum");
class User {
    _id;
    name;
    email;
    date_of_birth;
    password;
    created_at;
    updated_at;
    email_verify_token;
    forgot_password_token;
    verify;
    bio;
    location;
    website;
    username;
    avatar;
    cover_photo;
    constructor(user) {
        this._id = user._id;
        this.name = user.name || "";
        this.email = user.email;
        this.date_of_birth = user.date_of_birth || new Date();
        this.password = user.password;
        this.created_at = user.created_at || new Date();
        this.updated_at = user.created_at || new Date();
        this.email_verify_token = user.email_verify_token || "";
        this.forgot_password_token = user.forgot_password_token || "";
        this.verify = user.verify || enum_1.UserVerifyStatus.Unverified;
        this.bio = user.bio || "";
        this.location = user.location || "";
        this.website = user.website || "";
        this.username = user.username || "";
        this.avatar = user.avatar || "";
        this.cover_photo = user.cover_photo || "";
    }
}
exports.default = User;
