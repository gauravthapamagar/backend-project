import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt, { decode } from "jsonwebtoken";

//asyncHandler automatically catches error and passes it to express error handling middlewares.
//it avoids repetitive try catch blocks, keep code clean and readable.
// normally if only async is used then these all happens which is resolved by asynchandler which is one of the feature of express.
const generateAccessandRefreshTokens = async(userId) => {
    //try catch is used in order to prevent from getting error
    try {
        //to generate token you must find the user
        const user = await User.findById(userId)
        //how to generate access token and refresh token
        //hold both of the token written in user model into variables.
        const accessToken = user.generateAccessToken() //till now we have only generated this inside this method, it has not gone outside of the method
        const refreshToken = user.generateRefreshToken()

        //since refresh token also need to be stored into the database so 
        user.refreshToken = refreshToken
        //save the user
        //whenever the save function is used it also looks for the required field in the model but
        //here is no any required field so we user
        //since this is database operation so it takes time hence use await
        await user.save({validateBeforeSave: false})

        //at this point we have our refresh token as well as access token, refresh token is already retrieved and saved to the database
        //after this point return return the access token and refresh token
        return {accessToken, refreshToken}
        
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}
//create method to register the user
const registerUser = asyncHandler(async (req, res) => {
   
    //  get user details from frontend
    //  validation 
    //  check if user already exists (username or email)
    //  check for images, check for avatar
    //  upload them to cloudinary, avatar
    //  create user object - create entry in db
    //  remove password and refresh token field from response
    //  check for user creation 
    //  return response

    //req.body le body ma bhako sabai bata data lincha
    const {fullname, email, username, password} = req.body;  
    console.log("Request body ma bhako lai print garera hereko:", req.body);
    // console.log("email: ", email);
    // console.log(req.body);
    //validation
    //this is also one way
    /*if(fullname === ""){
        throw new ApiError(400, "fullname is required")
    }*/
   //another way is that 
   //here we check if there is any empty strings passed as a datapoints
   if (
        [fullname, email, username, password].some((field) => field?.trim() === "")

   ){
        throw new ApiError(400, "all fields are required")
   }
   //check if user already exists (here we check from email)
   const existedUser = await User.findOne({
    //we use operators
    ///$or 
    $or: [{ username },{ email }]
   })

   if(existedUser){
    throw new ApiError(409, "User with email or username aleady exists")
   }
   //i addded option from chatgpt not in hitesh code so if error comes then it could be the potential problem
//    res.status(200).json({
//     success: true,
//     message: "User does not exist, you can proceed with registration."
// });
    //why localpath because it is in the local server, it hasnt gone to the cloudinary

   // console.log(req.files);
   //localpath ko avatar nikalne kosis gareko ani tespachi upload garne koshish garinchha
   const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


   //check for images/avatar //if not got then throw error
   if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
    
   }
   if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is required");
}

   //if it is received then 
   //upload it to cloudinary
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)



   //if avatar not uploaded then throw error
   if(!avatar){
    throw new ApiError(400, "Avatar file is required")

   }

   //create entry in the database...
   //create is a method so it will take objects
   //if everything is done then do the following steps
   //mongodb is case sensitive so if below these names are different example: in model there was coverimage and here coverImage then
   //the cover Image will not be uploaded in the database.
   const user =await User.create({
    fullname,
    avatar: avatar.url, //here is 100% validation that avatar is uploaded but in case of coverImage which is not validated
    coverImage: coverImage?.url || "",
    email, 
    password,
    username: username.toLowerCase()
   })
   console.log("User Created:", user);  // Check if coverImage is saved in the user object

    // now check if the user is empty or not
    // .select() bhanne euta function jasma tyo tyo chiz select garnu sakinchha which we think are to be selected 
    // .select() bhitra pass hunchha string jasma tyo tyo string lekhinchha jun hamilaai chaidaina
    //if received value then remove the password and the referesh token 
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"

    )
    //if user is not created then throw error
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user.")
        
    }

    //return response
    //api response banauna ko lagi euta class banaisakeko cha jasle sabai data organized way ma pathauchha
    res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
    // console.log("Files received in request:", req.files);


})

//this is for login the user
const loginUser = asyncHandler( async(req, res) => {
    //get data from req.body
    //username or email
    //find the user
    //check the password
    //access and refresh token
    //send cookies 
    const {username, email, password} = req.body;

    //check of username or email is entered by the user
    if(!(username || !email)) {
        throw new ApiError(400, "Username or email is required")
    }
    //find username or email present in the database
    
    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    //if these didnot appear then 
    if (!user) {
        throw new ApiError(404, "User doesnot exist")
        
    }
    //if user is in the database then
    //check for the password
    //in password there is bcrypt so we have to use await compulsarily
    //User is available through mongoose of the mongodb , user is our own made user which
    //we retrieved an instance from the database
    const isPasswordValid = await user.isPasswordCorrect(password) //this password is retrieved from req.body
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
        
    }
    //if the password of the user is also correct then create access and refresh token 
    //now these are most common and are used frequently so we create these in a separate method

    //after using this function what will get is accesstoken and refresh token so we also take that by destructing 
    const {accessToken, refreshToken} = await generateAccessandRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")

    //this is for cookies
    //cookie can be by default modified by anybody from the frontend.
    //doing httpOnly and secure makes sure that it is only modifiable through the server.
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            //this {} field is data. you can see in ApiResponse where there is written this.data = data
            {
                loggedInUser, accessToken, refreshToken
            },
            "user logged In Successfully"
        )
    )
})
const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            //it is the mongodb operator which tells what are the objects/fields to be update
            $set:{
                refreshToken: undefined
            }
        },
        {
            //we will get new update value in the response of the return 
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})
    //cookies ko lagi bring the options

//we have to create endpoints
//before that we will make controllers

const refreshAccessToken = asyncHandler(async(req, res) => {
    //access cookies
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    //if there is no incoming refresh token
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")        
    }
    //verify incoming tokens
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET
        )
        //get the user information from mongodb
        const user = await User.findById(decodedToken?._id)
    
        //if there is no user
        if (!user) {
            throw new ApiError(401, "Unauthorized request")        
        }
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }
        //generate new refresh token 
        const options = {
            httpOnly: true, 
            secure: true
        }
        const {accessToken, newrefreshToken} = await generateAccessandRefreshTokens(user._id)
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken: newrefreshToken
                },
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
        
    }

})

//change user password
const changeUserPassword = asyncHandler(async(req,res) => {
    const {oldPassword, newPassword} = req.body
    const User = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"))
})
//get current user
const getCurrentUser = asyncHandler(async(req, res) => {
    return res.status(200).json(200, req.user, "Current user fetched successfully")
})
//update the account details of the user in the database
const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullname, email} = req.body
    if (!fullname || !email) {
        throw new ApiError(400, "All fields are required")
        
    }
    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            //$set updates specific field without modifying the entire document
            $set:{
                fullname: fullname,
                email: email,

            },


        },
        // this is used to return the updated document instead of the old one. It is used in findByIdAndUpdate function
        {
            new:true
        }
    ).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})

//file upload features
//you need to take care of the middlewares
const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file missing")
        
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new:true}
    ).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200, "Cover image updated successfully"))

})
//update cover image
const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file missing")
        
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading coverImage")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new:true}
    ).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200, "Cover image updated successfully"))

})




export {registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeUserPassword, 
    getCurrentUser, 
    updateAccountDetails, 
    updateUserAvatar
}   