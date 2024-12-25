import mongoose, { mongo } from "mongoose";
import { DB_NAME } from "../constants.js"; 

//following is the function that performs connection with database. 

const connectDB = async ()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);//connecting to database using the URI and name of database (which is defined in constants.js)
        console.log(`MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    }
    catch(error){
        console.log("MONGODB error: ", error);
        process.exit(1); //Exits the process with a non-zero status code, It signals to the operating system (or parent process) that the program encountered an issue and did not complete successfully.
        
    }

}

export default connectDB;