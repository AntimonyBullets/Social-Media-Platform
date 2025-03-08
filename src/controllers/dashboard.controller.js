import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// the following functionality needs improvement
const getChannelStats = asyncHandler(async (req, res) => {
    const videos = await Video.find({owner: req.user._id});
    let totalViews = 0;
    for(const element of videos) totalViews += element['views'];

    const subscribers = await Subscription.find({channel: req.user._id});
    let totalSubscribers = subscribers.length;

    let totalVideos = videos.length;

    const videolikes = await Like.find({likedBy: req.user._id, video: {$exists: true}});
    let totalLikedVideos = videolikes.length;

    const tweetLikes = await Like.find({likedBy: req.user._id, tweet: {$exists: true}});
    let totalLikedTweets = tweetLikes.length;

    return res
    .status(200)
    .json(new ApiResponse(200, { totalViews, totalSubscribers, totalVideos, totalLikedVideos, totalLikedTweets }, "Channel stats fetched successfully!"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find({owner: req.user._id})
    .populate('owner', 'username fullName avatar');

    return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully!"))
})

export { 
    getChannelStats, 
    getChannelVideos
    }