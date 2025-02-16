import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"

//suppose here in req, res, next if res is not used you can simple write _
export const verifyJWT = asyncHandler(async (req, _, next) => {
   try {
     const token = req.cookie?.accessToken || req.header("Authorization:")?.replace("Bearer ", "") //kita token cookie bata nikaal or
     //authorization use garera bearer token bata nikaal
     if(!token) {
         throw new ApiError(401, "Unauthorized request ")
     }
     //verify
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
 
     const user = await User.findbyId(decodedToken?._id).select("-password -refreshToken")
 
     if(!user){
         throw new ApiError(401, "Invalid access tokenmn")
     }
     req.user = user
     next()
     //what will happen afterwards is that 
   } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
   }
})