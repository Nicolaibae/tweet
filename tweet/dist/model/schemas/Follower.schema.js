"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Follower {
    _id;
    user_id;
    created_at;
    followed_user_id;
    constructor({ _id, user_id, created_at, followed_user_id }) {
        this._id = _id;
        this.user_id = user_id;
        this.created_at = created_at || new Date();
        this.followed_user_id = followed_user_id;
    }
}
exports.default = Follower;
