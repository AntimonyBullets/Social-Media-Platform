import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async(req, res)=>{
    const { content } = req.body;
    if(!content){
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    });

    if(!tweet) throw new ApiError(500, "Server error");

    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet has successfully been created."))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) throw new ApiError(404, "Route not found!");

    const tweets = await Tweet.find(
        { owner: userId},
        { owner: 1, content: 1, _id: 0}
    );

    return res
    .status(200)
    .json(new ApiResponse(200, tweets, "User's tweets fetched successfully!"))

})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if(!tweetId) throw new ApiError(404, "Route not found!");

    const { content } = req.body;
    if(!content) throw new ApiError(400, "Content is required!")

    const tweet = await Tweet.findById(tweetId);
    
    if(!tweet){
        throw new ApiError(404, "Tweet not found!");
    }
    if(!tweet.owner.equals(req.user._id)) throw new ApiError(401, "Unauthorized access!");

    tweet.content = content;

    await tweet.save();

    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully!"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}