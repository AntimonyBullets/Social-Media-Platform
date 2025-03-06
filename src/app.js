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

app.use(cookieParser());


//importing router
import userRouter from './routes/user.route.js';
import videoRouter from './routes/video.route.js';
import tweetRouter from './routes/tweet.route.js';
import subscriptionRouter from './routes/subscription.route.js';
import likeRouter from './routes/like.route.js';
import commentRouter from './routes/comment.route.js';

app.use('/api/v1/users', userRouter); //Here app.use() middleware is used to transfer control to userRouter in the user.route.js file if a route extending /api/v1/users (for example /api/v1/users/register) is hit

app.use('/api/v1/videos', videoRouter);

app.use('/api/v1/tweets', tweetRouter);

app.use('/api/v1/subscriptions', subscriptionRouter);

app.use('/api/v1/likes', likeRouter);

app.use('/api/v1/comments', commentRouter);

export {app};