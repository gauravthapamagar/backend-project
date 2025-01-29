import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


//create a function and export it
//async function because database is in different continent
//put in try catch because there always can be problem
const connectDB = async () =>{
    try{
        //we can store in any variable
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`Mongodb connection successful !! DB HOST: ${connectionInstance.connection.host}`)
    }
    catch (error){
        console.log("Mongodb connection error ", error)
        process.exit(1);
    }


}

export default connectDB;
