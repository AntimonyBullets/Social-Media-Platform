import mongoose, {isValidObjectId, mongo} from "mongoose";
import {Like} from "../models/like.model.js";
import { Tweet } from "../models/tweet.model.js";
import {Comment} from "../models/comment.model.js";
import { Video } from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    if(!videoId || !mongoose.isValidObjectId(videoId)) throw new ApiError(404, "Video not found!");

    const video = await Video.findById(video);
    if(!video) throw new ApiError(404, "Video does not exist");

    const aggregationPipeline = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from: 'videos',
                localField: 'video',
                foreignField: '_id',
                as: 'video',
                pipeline:[
                    {
                        $lookup:{
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'owner',
                            pipeline:[
                                {
                                    $project:{
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        },
                        
                    },
                    {
                        $addFields:{
                            owner: {$first: '$owner'}
                        }
                    },
                    {
                        $project:{
                            owner:1,
                            title:1,
                            thumbnail:1,
                            views:1
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from: 'users',
                localField: 'likedBy',
                foreignField: '_id',
                as: 'likedBy',
                pipeline:[
                    {
                        $project: {
                            username: 1,
                            thumbnail:1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                video: {$first: '$video'},
                likedBy: {$first: '$likedBy'}
            }
        },
        {
            $project:{
                likedBy:1,
                video:1
            }
        }
    ]

    const videoLike = await Like.aggregate(aggregationPipeline);

    if(!videoLike.length){
        const createVideoLike = await Like.create({
            likedBy : new mongoose.Types.ObjectId(req.user._id),
            video : new mongoose.Types.ObjectId(videoId)
        });
        if(!createVideoLike) throw new ApiError(500, "Some error occured while liking the video");

        const finalVideoLike = await Like.aggregate(aggregationPipeline);
        //we may or may not need to send such detailed (aggregated) response to the client, we'll see this later in frontend.

        return res.status(200).json(new ApiResponse(200, finalVideoLike, "Like added to the video successfully!"))
    }

    const removeVideoLike = await Like.deleteOne({video: videoId});
    if(!removeVideoLike.deletedCount) throw new ApiError(500, "Some error occured while removing the like from the video");

    return res.status(200).json(new ApiResponse(200, videoLike, "Like removed from the video successfully!"));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!commentId || !mongoose.isValidObjectId(commentId)) throw new ApiError(404, "Comment not found!");

    const comment = await Comment.findById(commentId);
    if(!comment) throw new ApiError(404, "Comment does not exist")

    const commentLike = await Like.findOne({comment: commentId});

    if(!commentLike){
        const createCommentLike = await Like.create({
            likedBy: new mongoose.Types.ObjectId(req.user._id),
            comment: new mongoose.Types.ObjectId(commentId)
        });

        if(!createCommentLike) throw new ApiError(500, "Some error occured while liking the comment");
        
        return res.status(200).json(new ApiResponse(200, createCommentLike, "Like added to the comment successfully!"))
    }

    const removeCommentLike = await Like.deleteOne({comment: commentId});
    if(!removeCommentLike.deletedCount) throw new ApiError(500, "Some error occured while removing the like from the comment");

    return res.status(200).json(new ApiResponse(200, commentLike, "Like removed from the comment successfully!"));

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;
    if(!tweetId || !mongoose.isValidObjectId(tweetId)) throw new ApiError(404, "Tweet not found!");

    const tweet = await Tweet.findById(tweetId);
    if(!tweet) throw new ApiError(404, "Tweet does not exist");

    const tweetLike = await Like.findOne({tweet: tweetId});

    if(!tweetLike){
        const createTweetLike = await Like.create({
            likedBy: new mongoose.Types.ObjectId(req.user._id),
            tweet: new mongoose.Types.ObjectId(tweetId)
        });

        if(!createTweetLike) throw new ApiError(500, "Some error occured while liking the tweet");
        
        return res.status(200).json(new ApiResponse(200, createTweetLike, "Like added to the tweet successfully!"))
    }

    const removeTweetLike = await Like.deleteOne({tweet: tweetId});
    if(!removeTweetLike.deletedCount) throw new ApiError(500, "Some error occured while removing the like from the tweet");

    return res.status(200).json(new ApiResponse(200, tweetLike, "Like removed from the tweet successfully!"));
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}