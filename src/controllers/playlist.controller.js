import mongoose, {isValidObjectId, mongo} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body;

    if(!name || !description) throw new ApiError(400, "Both name and description are required");

    const playlist = await Playlist.create({
        name,
        description,
        videos: [],
        owner: req.user._id
    });

    if(!playlist) throw new ApiError(500, "Some error occurred while creating the playlist");

    const populatedPlaylist = await Playlist.findById(playlist._id).populate('owner', 'username fullName avatar');

    if(!populatedPlaylist) throw new ApiError(500, "Some error occurred!");

    return res
    .status(200)
    .json(new ApiResponse(200, populatedPlaylist, "Playlist created successfully!"))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!userId || !mongoose.isValidObjectId(userId)) throw new ApiError(404, "Playlist not found!");

    const user = await User.findById(userId);
    if(!user) throw new ApiError(404, "User does not exist")

    const playlists = await Playlist.find({ owner: userId})
    .populate('owner', 'username fullName avatar');

    return res
    .status(200)
    .json(new ApiResponse(200, playlists, "User's playlists fetched successfully!"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!playlistId || !mongoose.isValidObjectId(playlistId)) throw new ApiError(404, "Playlist not found!");

    const playlist = await Playlist.findOne({_id: playlistId})
    .populate('owner', 'username fullName avatar')
    .populate({
        path: 'videos',
        select: 'thumbnail owner views title',
        populate: { path: 'owner', select: "username fullName avatar"}
    });

    if(!playlist) throw new ApiError(404, "Playlist does not exist or Unauthorized access");

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully!"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;
    if(!playlistId || !mongoose.isValidObjectId(playlistId)) throw new ApiError(404, "Playlist list not found!");

    if(!videoId || !mongoose.isValidObjectId(videoId)) throw new ApiError(404, "Video not found!");

    let video = await Video.findById(videoId);
    if(!video) throw new ApiError(404, "Video does not exist!");

    const playlist = await Playlist.findOneAndUpdate(
        { _id: playlistId, owner: req.user._id},
        {
            $push: {videos: new mongoose.Types.ObjectId(videoId)}
        },
        { returnDocument: "after"}
    )
    .populate('owner', 'username fullName avatar')
    .populate({
        path: 'videos',
        select: 'thumbnail title views owner',
        populate: { path: 'owner', select: 'username fullName avatar'}
    });

    if(!playlist) throw new ApiError(404, "Playlist not found or Unauthorized request");

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video added to playlist successfully!"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;
    if(!playlistId || !mongoose.isValidObjectId(playlistId)) throw new ApiError(404, "Playlist not found!");

    if(!videoId || !mongoose.isValidObjectId(videoId)) throw new ApiError(404, "Video not found!");
    
    const playlist = await Playlist.findOne({_id: playlistId, owner: req.user._id});
    if(!playlist) throw new ApiError(404, "Playlist not found or Unauthorized access");

    if(!playlist.videos.some((vid) => vid.equals(videoId))){
        throw new ApiError(404, "Video does not exist in the playlist!")
    }

    const finalPlaylist = await Playlist.findOneAndUpdate(
        { _id: playlistId },
        { $pull: { videos: videoId } },
        {returnDocument: 'after'}
    )
    .populate('owner', 'username fullName avatar')
    .populate({
        path: 'videos',
        select: 'thumbnail title views owner',
        populate:{ path: 'owner', select: 'username fullName avatar' }
    });

    if(!finalPlaylist) throw new ApiError(500, "Some error occurred while updating the playlist");

    return res
    .status(200)
    .json(new ApiResponse(200, finalPlaylist, "Video removed from the playlist successfully!"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    if(!playlistId || !mongoose.isValidObjectId(playlistId)) throw new ApiError(404, "Playlist not found!");

    const playlist = await Playlist.findOneAndDelete( { _id: playlistId, owner: req.user._id} );

    if(!playlist) throw new ApiError(404, "Playlist does not exist or Unauthorized access");

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist deleted successfully!"))  
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!playlistId || !mongoose.isValidObjectId(playlistId)) throw new ApiError(404, "Playlist not found!");

    if(!name && !description) throw new ApiError(400, "No modifications done (Neither of description and name has been changed");

    const playlist = await Playlist.findOne({_id: playlistId, owner: req.user._id})
    .populate('owner', 'username fullName avatar')
    .populate({
        path: 'videos',
        select: 'thumbnail owner views title',
        populate: { path: 'owner', select: "username fullName avatar"}
    });

    if(!playlist) throw new ApiError(404, "Playlist does not exist or Unauthorized access");


    if(name?.trim()) playlist.name = name;
    if(description?.trim()) playlist.description = description;

    await playlist.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully!"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}