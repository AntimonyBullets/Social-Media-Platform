import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
} from "../controllers/like.controller.js"
import {verfiyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verfiyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").put(toggleVideoLike);
router.route("/toggle/c/:commentId").put(toggleCommentLike);
router.route("/toggle/t/:tweetId").put(toggleTweetLike);
router.route("/videos").get(getLikedVideos);

export default router