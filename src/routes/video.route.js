import { Router } from 'express';
import { verfiyJWT } from '../middlewares/auth.middleware.js';
import { uploadVideo } from '../controllers/video.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route("/upload").post(
    verfiyJWT,
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
    uploadVideo);
export default router;