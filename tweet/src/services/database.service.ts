
import { MongoClient, Db, Collection } from 'mongodb';
import dotenv from "dotenv"
import User from "../model/schemas/User.schema"
import RefreshToken from '../model/schemas/RefreshToken.schema';
import Follower from '../model/schemas/Follower.schema';
import Tweet from '../model/schemas/tweet.schema';
import Bookmark from '../model/schemas/bookmark.schema';
import Hashtag from '../model/schemas/Hashtag.schema';
import Like from '../model/schemas/likes.schema';



dotenv.config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.fw7gkbr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

export class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri);
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    try {
      const db = this.client.db("admin")
      // await this.client.connect();
      await db.command({ ping: 1 })
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
      console.log("không kết nối được database")
    }
  }
  async indexUsers() {
    const exists = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1'])

    if (!exists) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }
  async indexRefreshToken() {
    const exists = await this.refreshTokens.indexExists(['exp_1', 'token_1'])

    if (!exists) {
      this.refreshTokens.createIndex({ token: 1 })
      this.refreshTokens.createIndex(
        { exp: 1 },
        {
          expireAfterSeconds: 0
        }
      )
    }
  }
  async indexVideoStatus() {
    const exists = await this.videoStatus.indexExists(['name_1'])

    if (!exists) {
      this.videoStatus.createIndex({ name: 1 })
    }
  }
  async indexFollower() {
     const exists = await this.followers.indexExists(['user_id_1_followed_user_id_1'])
    if (!exists) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
    }
  }
  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }
  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEETS_COLLECTION as string)
  }
  get hashtags(): Collection<Hashtag> {
    return this.db.collection(process.env.DB_HASHTAGS_COLLECTION as string)
  }
  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(process.env.DB_BOOKMARKS_COLLECTION as string)
  }
   get likes(): Collection<Like> {
    return this.db.collection(process.env.DB_LIKES_COLLECTION as string)
  }
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }
  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }
  get videoStatus(): Collection<Follower> {
    return this.db.collection(process.env.DB_VIDEOSTATUS_COLLECTION as string)
  }

}

const databaseService = new DatabaseService
export default databaseService
