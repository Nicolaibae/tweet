import { NextFunction, Request,Response } from "express";
import  express  from "express";
import databaseService from "./services/database.service";
import usersRouter from "./routes/users.routes";

const port = 3003

const app = express();
app.use(express.json());
databaseService.connect()



app.use("/users",usersRouter)
app.use((err:any,req:Request,res:Response,next:NextFunction)=>{
  res.status(400).json({
    error:err.message
  })
})
app.listen(port,()=>{
  console.log(`Server running on port ${port}`);
})


