import { asyncHandler } from "../utils/asyncHandler.js";

//create method to register the user
const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message:"hello i am under water"
    })

})

export {registerUser}   