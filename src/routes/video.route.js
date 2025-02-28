import { Router } from 'express';
import { verfiyJWT } from '../middlewares/auth.middleware.js';
import { deleteVideo, searchVideos, getVideoById, togglePublishStatus, updateVideo, uploadVideo } from '../controllers/video.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();
router.use(verfiyJWT); 

router
    .route("/upload")
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount : 1
            },
            {
                name: "thumbnail",
                maxCount : 1
            }
        ]),
        uploadVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .patch(upload.single('thumbnail'),updateVideo)
    .delete(deleteVideo);

router
    .route("/search")
    .get(searchVideos);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);
export default router;