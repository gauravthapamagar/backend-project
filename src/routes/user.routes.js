import { Router } from "express";
import {registerUser}  from "../controllers/user.controller.js"

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


export default router   