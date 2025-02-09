import { Router } from 'express';
import { verfiyJWT } from '../middlewares/auth.middleware.js';
import { getVideoById, uploadVideo } from '../controllers/video.controller.js';
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
    .get(getVideoById);
export default router;