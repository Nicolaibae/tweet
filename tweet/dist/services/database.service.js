"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.fw7gkbr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
class DatabaseService {
    client;
    db;
    constructor() {
        this.client = new mongodb_1.MongoClient(uri);
        this.db = this.client.db(process.env.DB_NAME);
    }
    async connect() {
        try {
            const db = this.client.db("admin");
            // await this.client.connect();
            await db.command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
        }
        catch (error) {
            console.log("không kết nối được database");
        }
    }
    get users() {
        return this.db.collection(process.env.DB_USERS_COLLECTION);
    }
    get refreshTokens() {
        return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION);
    }
    get followers() {
        return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION);
    }
}
exports.DatabaseService = DatabaseService;
const databaseService = new DatabaseService;
exports.default = databaseService;
