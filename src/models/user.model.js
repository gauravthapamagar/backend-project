//always these same steps in models 
/* for example:
import mongoose, {Schema} from 'mongoose';
const userSchema = new Schema({})
export const User = mongoose.Schema("User", userSchema);
*/



import mongoose, {Schema} from 'mongoose';
// schema is an Object Data Modeling (ODM) library for MongoDB and Node.js.
//defines the structure of the documents within mongodb collection.
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

const userSchema = new Schema (
    {
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true, 
        index: true, //in mongodb if you want to make searchable for anyfield make index true. so that it comes in searching of database
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true, 
    },
    fullname: {
        type: String,
        required: true,
        trim: true, 
        index: true,
    },
    avatar: {
        type: String, // cloudinary URL
        required: true,
    },
    coverimage: {
        type: String, 
        required: true,
    },
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    refreshToken: {
        type: String,
    }
    
},
    {
        timestamps: true
    }

)
//now this pre hook runs just before save functionality below one 
//password hashing 
//use of async because generally these functions takes lot of time to be executed. //next is written because its middleware flag
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password, 10)
    next()
})

//designing custom methods
//this is the way to inject the method in the schema
userSchema.methods.isPasswordCorrect = async function(password){
    //password hasing is cryptography so it will take time so await that
   return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    //jwt has sign method that generates the token
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username, 
        fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
//here fullname is the payload name and this.fullname is coming from the database

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id,
        
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)
}

export const User = mongoose.model("User", userSchema);