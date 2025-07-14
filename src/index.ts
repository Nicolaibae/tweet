
import  express  from "express";
import databaseService from "./services/database.service";
import usersRouter from "./routes/users.routes";
import { defaultErrorHandler } from "./middleware/error.middleware";

databaseService.connect()
const port = 4000

const app = express();
app.use(express.json());




app.use("/users",usersRouter)
app.use(defaultErrorHandler as any)

app.listen(port,()=>{
  console.log(`Server running on port ${port}`);
})


