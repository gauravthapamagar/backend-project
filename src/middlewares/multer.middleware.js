import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "./public/temp")
        //here it is the destination folder where we will keep all the files.

    },
    filename: function (req, file, cb){
        cb(null, file.originalname)
        //doing original name allows to store the exact original file name but the original name can be same for different folder?
        //the operation in server stays in the tiny amount so that it stays for little bit, we upload file in cloudinary and delete
        //hence we dont need to worry much
    }
})
export const upload = multer({
    storage,
})