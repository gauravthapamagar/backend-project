import express from 'express';
import cors from "cors";
//cookieparser work: from our server we can access user cookies and also can set cookies
import cookieParser from 'cookie-parser'; //using this we have cookie access examples can be seen at user.controllers.js

const app = express();

// CORS configuration: Allows requests from specified origin(s)
app.use(cors({
    //which which origin you are allowing
    origin: process.env.CORS_ORIGIN,
    credentials: true

}))
//PARSE: analyse or interpret the data typically making it easier to work with.
//make limit for json 
// Middleware to parse JSON bodies with a size limit
app.use(express.json({limit: "16kb"}))
// Middleware to parse URL-encoded data (e.g., form submissions) with a size limit
app.use(express.urlencoded({extended: true, limit: "16kb"}))
// sometimes we want to store some files folders images then it creates public folder for public access
app.use(express.static("public"))
// Middleware to parse cookies from incoming requests
app.use(cookieParser())


//routes import
//you can import routes to here by the following code

import userRouter from './routes/user.routes.js'


//routes declaration
//normally we used to do app.get app.listen but that was in the scenario where we used to write routes and controllers
//but now things are separated. now to import router we will use middlewares then we should use app.use

app.use("/api/v1/users", userRouter) //esma jaba users bhanne ma jancha then controls are passed out to the userrouter then 
//it will go towards that route file
//so how this will work is that
//https://localhost:8000/api/v1/users/register
export { app };