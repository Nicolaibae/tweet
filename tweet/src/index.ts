
import  express  from "express";
import databaseService from "./services/database.service";
import usersRouter from "./routes/users.routes";
import { defaultErrorHandler } from "./middleware/error.middleware";
import mediasRouter from "./routes/medias.routes";
import { initFolder } from "./utils/files";
import { config } from "dotenv";
import argv from 'minimist'
import path from "path";
import staticRouter from "./routes/static.routes";
import { UPLOAD_VIDEO_DIR } from "./constants/dir";
const option = argv(process.argv.slice(2))
config()
databaseService.connect()
const port = process.env.PORT || 4000

initFolder() // khi khởi động sever nếu chauw có folder sẽ tự động tạo

const app = express();
app.use(express.json());




app.use("/users",usersRouter)
app.use("/medias",mediasRouter)
app.use("/static",staticRouter)
app.use('/static/video',express.static(UPLOAD_VIDEO_DIR))
app.use(defaultErrorHandler as any)

app.listen(port,()=>{
  console.log(`Server running on port ${port}`);
})


