import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verfiyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verfiyJWT); 

router
    .route("/c/:channelId")
    .get(getUserChannelSubscribers)
    .put(toggleSubscription);

router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router