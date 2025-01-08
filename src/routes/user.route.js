import {Router} from 'express';
import {registerUser} from '../controllers/user.controller.js';
const router = Router();
import {upload} from '../middlewares/multer.middleware.js'

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
    ]), //adding a middleware which will act just before the execution of 'registerUser', this middlewares enables taking input of files from user. We're gonna take input 2 image files 'avatar' and 'coverImage'
    registerUser);
// if anyone hits api/v1/user/register with post request 'registerUser' callback is executed.


export default router;
