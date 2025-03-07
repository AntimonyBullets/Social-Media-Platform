import mongoose, {isValidObjectId, mongo} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


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
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
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
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
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