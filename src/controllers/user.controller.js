import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export {registerUser}   