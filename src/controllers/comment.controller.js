import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params;
    if(!videoId || !mongoose.isValidObjectId(videoId)) throw new ApiError(404, "Video not found!");

    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(404, "Video does not exist!");
    
    const {content} = req.body;
    if(!content) throw new ApiError(400, "Content is required!");

    const comment = await Comment.create({
        content: content,
        video: new mongoose.Types.ObjectId(videoId),
        owner: req.user._id
    });

    if(!comment) throw new ApiError(500, "Some error occurred while posting the comment");

    const populatedComment = await Comment.findById(comment._id).populate("owner", "username fullName avatar");

    return res
    .status(200)
    .json(new ApiResponse(200, populatedComment, "Comment added successfully!"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }