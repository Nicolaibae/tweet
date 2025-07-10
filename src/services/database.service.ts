
import { MongoClient, Db, Collection } from'mongodb';
import dotenv from "dotenv"
import User from "../model/schemas/User.schema"
import RefreshToken from '../model/schemas/RefreshToken.schema';
import Follower from '../model/schemas/Follower.schema';



dotenv.config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.fw7gkbr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

export class DatabaseService{
   private client:MongoClient
   private db:Db
  constructor(){
    this.client = new MongoClient(uri);
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect(){
    try {
      const db= this.client.db("admin")
    // await this.client.connect();
    await db.command({ ping: 1 })
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch(error) {
   console.log("không kết nối được database")
  }
  }
  get users(): Collection<User>{
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }
  get refreshTokens(): Collection<RefreshToken>{
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }
  get followers(): Collection<Follower>{
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }
 
}

const databaseService = new DatabaseService
export default databaseService
