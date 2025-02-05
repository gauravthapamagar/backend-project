// require('dotenv').config({path: './env'})
//improved version to maintain consistency
import dotenv from 'dotenv';
import { app }  from './app.js';
import connectDB from "./db/index.js";

dotenv.config({
    path: './.env'
})
connectDB()

//after doing this app.listen then only our server will start after connecting mongodb 
//because until this our application hasnt started listening using that database
//starts the backend server using app.listen
.then(() =>{
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on ${process.env.PORT}`);
    })
    
})
.catch((error) => {
    console.log("MONGODB connection failed!!!", error);

})