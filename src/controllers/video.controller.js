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
    } //throwing error if video is private and if request of getting the video is not done by the owner himself.
    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req,res)=>{
    const { videoId } = req.params;

    const {title, description} = req.body;

    if(!title || !description){
        throw new ApiError("Title and description can not be empty!")
    }

    const thumbnailLocalPath = req.file?.path;

    if(!thumbnailLocalPath){
        const video = await Video.findOneAndUpdate(
            { _id: videoId, owner: req.user._id },
            {
                $set:{
                    title,
                    description
                }
            },
            { new: true, runValidators: true }
        );

        if(!video){
            throw new ApiError(404, "Video not found!")
        }

        return res
        .status(200)
        .json(new ApiResponse(200, video, "Video details updated successfully!"))
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!thumbnail?.url){
        throw new ApiError(500, "Some problem occured while uploading the file");
    }




    
    
})
export { uploadVideo, getVideoById };