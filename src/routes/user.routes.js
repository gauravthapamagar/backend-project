import { Router } from "express";
import {registerUser,loginUser, logoutUser, refreshAccessToken}  from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"
const router = Router();

//esma directly execute vairachha if it goes towards register route
//to insert/inject middleware then (see how the upload.field is written in this code)
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            //frontend ko field banchha then also its field name must be avatar 
            //this communication is necessary in the frontend and backend
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),

    registerUser
)
//added new route 
//yo bhaneko chei if yo route ma aayo bhaane kun method use garne ta jastei ki post, get
router.route("/login").post(loginUser)

//secured routes
//if you want to inject middleware then write it betwenn route and method call
//here verifyJWT is middleware
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
export default router   