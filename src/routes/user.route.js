import {Router} from 'express';
import {registerUser, loginUser, logoutUser, refreshAccessToken} from '../controllers/user.controller.js';
const router = Router();
import {upload} from '../middlewares/multer.middleware.js';
import { verfiyJWT } from '../middlewares/auth.middleware.js';

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount: 1
        }
    ]), //adding a middleware which will act just before the execution of 'registerUser', this middleware enables taking input of files from user. We're gonna take input 2 image files 'avatar' and 'coverImage'
    registerUser);
// if anyone hits api/v1/user/register with post request 'registerUser' callback is executed.

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verfiyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);


export default router;
