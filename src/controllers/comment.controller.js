import mongoose, { mongo } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    if(!videoId || !mongoose.isValidObjectId(videoId)) throw new ApiError(404, "Video not found!");
    
    const {page = 1, limit = 2} = req.query;


    if(page < 1 || page > limit) throw new ApiError(400, "Page not found!");
    if(limit < 1) throw new ApiError(400, "Limit can't be less than 1")

    const aggregationPipeline = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
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
            }
        },
        {
            $addFields:{
                owner: { $first: '$owner'}
            }
        }
    ]);

    const options = {
        page,
        limit
    };

    const videoComments = await Comment.aggregatePaginate(aggregationPipeline, options);

    return res
    .status(200)
    .json(new ApiResponse(200, videoComments, "Comments on the video fetched successfully!"));
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    if(!videoId || !mongoose.isValidObjectId(videoId)) throw new ApiError(404, "Video not found!");

    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(404, "Video does not exist!");
    
    const {content} = req.body;
    if(!content?.trim()) throw new ApiError(400, "Content is required!");

    const comment = await Comment.create({
        content: content.trim(),
        video: new mongoose.Types.ObjectId(videoId),
        owner: req.user._id
    });

    if(!comment) throw new ApiError(500, "Some error occurred while posting the comment");

    const populatedComment = await Comment.findById(comment._id).populate("owner", "username fullName avatar"); //populate() works somewhat similiar to $lookup in aggregation pipeline. Here we are overwriting the user's ObjectId in 'owner' with some selected attributes ('username', 'fullName', 'avatar') of the user document which matches with the ObjectId in 'owner'.

    return res
    .status(200)
    .json(new ApiResponse(200, populatedComment, "Comment added successfully!"))
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    if(!commentId || !mongoose.isValidObjectId(commentId)) throw new ApiError(404, "Comment not found!");

    const {content} = req.body;
    if(!content?.trim()) throw new ApiError(400, "Content is required!");

    const comment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: req.user._id }, 
        {
            $set:{
                content: content.trim()
            }
        },
        {
            returnDocument: "after" //to return the updated document
        }
    ).populate('owner', 'username fullName avatar');

    if(!comment) throw new ApiError(404, "Comment not found or Unauthorized request");

    return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment was updated successfully!"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    if(!commentId || !mongoose.isValidObjectId(commentId)) throw new ApiError(404, "Comment not found!");

    const comment = await Comment.findOneAndDelete(
        { _id: commentId, owner: req.user._id },
    );
    
    if(!comment) throw new ApiError(404, "Comment not found or Unauthorized request");

    return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment deleted successfully!"));
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }