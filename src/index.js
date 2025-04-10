import dotenv from 'dotenv';
import connectDB from './db/index.js';
import {app} from './app.js';
dotenv.config({
    path: './.env'
})// it will enable us using environment variables that are defined in '.env'

const port = process.env.PORT || 8000;
connectDB()
.then(()=>{
    app.listen(port, ()=>{
        console.log(`Server is running at ${port}`);
    })
})
.catch((err)=>{
    console.log("MONGODB connection failed!", err);
});








/*
import express from 'express';
const app = express();

;( async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error)=>{
            console.log("Error: ", error);
            throw error;
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("ERROR: ", error);
        throw error;
    }
})();
*/