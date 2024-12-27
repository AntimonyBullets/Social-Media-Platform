import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}
));

app.use(express.json({limit: "16kb"})) // any data that is being sent to us in JSON format would have a limit of 16kb, data of larger size is not permitted.

app.use(express.urlencoded({extended:true, limit:"16kb"})); //to parse the request body (if the request sent is in such format that it needs to be parsed) into javascript object.

app.use(express.static("public"));

export {app};