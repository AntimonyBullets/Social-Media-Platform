import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";


const uploadVideo = asyncHandler(async (req, res) =>{
    const {description, title} = req.body;
    
    if(!description || !title){
        throw new ApiError(400, "All fields are required");
    }
    
    const videoFileLocalPath = req.files?.videoFile?.[0].path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0].path;
 
    if(!videoFileLocalPath){
        throw new ApiError(400, "Video file is required");
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400, "Video thumbnail is required");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!videoFile || !thumbnail){
        throw new ApiError(500, "Error while uploading the files");
    }

    const duration = videoFile?.nb_frames * eval(videoFile?.video?.time_base);

    const video = await Video.create({
        description,
        title,
        thumbnail : thumbnail.url,
        videoFile : videoFile.url,
        owner : req.user._id,
        duration
    })

    if(!video){
        throw new ApiError(500, "Server error!");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video uploaded successfully!"));
})

const getVideoById = asyncHandler(async (req, res)=>{
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video not found!")
    }
    
    if(!video.isPublished && !video.owner.equals(req.user._id)){
        throw new ApiError(401, "You don't have access to this video");
    } //throwing error if video is private and the request of getting the video is not by the owner of the video himself
    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
})
export { uploadVideo, getVideoById };