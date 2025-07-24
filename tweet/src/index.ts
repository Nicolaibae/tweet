
import  express  from "express";
import databaseService from "./services/database.service";
import usersRouter from "./routes/users.routes";
import { defaultErrorHandler } from "./middleware/error.middleware";
import mediasRouter from "./routes/medias.routes";
import { initFolder } from "./utils/files";
import { config } from "dotenv";
import argv from 'minimist'
import staticRouter from "./routes/static.routes";
import { UPLOAD_VIDEO_DIR } from "./constants/dir";
import tweetsRouter from "./routes/tweets.routes";
import bookmarksRouter from "./routes/bookmarks.routes";
import likesRouter from "./routes/likes.routes";
// import "../src/utils/fake"
const option = argv(process.argv.slice(2))
config()
databaseService.connect().then(

  ()=>{
    databaseService.indexUsers()
    databaseService.indexRefreshToken()
    databaseService.indexVideoStatus()
    databaseService.indexFollower()
  }
)
const port = process.env.PORT || 4000

initFolder() // khi khởi động sever nếu chauw có folder sẽ tự động tạo

const app = express();
app.use(express.json());




app.use("/users",usersRouter)
app.use("/medias",mediasRouter)
app.use("/tweets",tweetsRouter)
app.use("/bookmarks",bookmarksRouter)
app.use("likes",likesRouter)
app.use("/static",staticRouter)
app.use('/static/video',express.static(UPLOAD_VIDEO_DIR))
app.use(defaultErrorHandler as any)

app.listen(port,()=>{
  console.log(`Server running on port ${port}`);
})


