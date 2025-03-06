import mongoose, {isValidObjectId, MongooseError} from "mongoose";
import {User} from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    //find the subscription document by using findOne and using filters as channel --> channelId and subscriber --> req.user._id.
    //if the document exists, use findOneAndDelete/deleteOne to delete the document. If it does not, use Subscription.create() to create a document.
    //return the response according to the conditon of pre-existence of document or not.
    if(!channelId || !mongoose.isValidObjectId(channelId)) throw new ApiError(404, "Channel not found");

    const channel = await User.findById(channelId);
    if(!channel) throw new ApiError(404, "Channel does not exist");

    if(req.user._id.equals(channelId)) throw new ApiError(400, "User can not subscribe himself/herself");

    const aggregationPipeline = [
        { 
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
                subscriber: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: 'users',
                localField: 'channel',
                foreignField: '_id',
                as: 'channel',
                pipeline: [
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
                channel: { $first: '$channel'}
            }
        }
    ]

    const subscription = await Subscription.aggregate(aggregationPipeline);

    if(!subscription.length){
        const createSubscription = await Subscription.create({
            channel: new mongoose.Types.ObjectId(channelId),
            subscriber: new mongoose.Types.ObjectId(req.user._id)
        });

        if(!createSubscription) throw new ApiError(500, "Some error occured while trying to subscribe");

        const finalSubscription = await Subscription.aggregate(aggregationPipeline);
        if(!finalSubscription) throw new ApiError(500, "Internal server Error");

        return res.status(200).json(new ApiResponse(200, finalSubscription[0], "Channel has been subscribed successfully!"));
    }
    else{
        const deleteSubscription = await Subscription.deleteOne({
            channel: channelId,
            subscriber: req.user._id
        });
        if(!deleteSubscription.deletedCount) throw new ApiError(500, "Some error occured while trying to unsubscribe");
        return res.status(200).json(new ApiResponse(200, subscription, "Channel has been unsubscribed successfully!"));
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if(!channelId || !mongoose.isValidObjectId(channelId)) throw new ApiError(404, "Channel not found!");

    const channel = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(channelId),
            }
        },
        {
            $lookup:{
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'channel',
                as: 'subscribers',
                pipeline:[
                    {
                        $lookup:{
                            from: 'users',
                            localField: 'subscriber',
                            foreignField: '_id',
                            as: 'subscriber',
                            pipeline: [
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
                        $addFields: {
                            subscriber: {$first: '$subscriber'}
                        }
                    },
                    {
                        $project:{
                            subscriber: 1
                        }
                    }
                ]
            }
        },
        {
            $project:{
                username: 1,
                fullName: 1,
                avatar: 1,
                subscribers: 1
            }
        }
    ]);

    if(!channel.length) throw new ApiError(404, "Channel does not exist");

    return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "Channel subscribers fetched succcessfully"));
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if(!subscriberId || !mongoose.isValidObjectId(subscriberId)) throw new ApiError(400, "User not found!");

    const subscriber = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'subscriber',
                as: 'subscribedTo',
                pipeline:[
                    {
                        $lookup:{
                            from: 'users',
                            localField: 'channel',
                            foreignField: '_id',
                            as: 'channel',
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        },
                    },
                    {
                        $addFields:{
                            channel: { $first: '$channel' }
                        }
                    },
                    {
                        $project:{
                            channel: 1
                        }
                    }
                ]
            }
        },
        {
            $project:{
                username: 1,
                fullName: 1,
                avatar: 1,
                subscribedTo: 1
            }
        }
    ]);

    if(!subscriber.length) throw new ApiError(404, "User does not exist");

    return res
    .status(200)
    .json(new ApiResponse(200, subscriber[0], "Subscriptions fetched successfully!"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}