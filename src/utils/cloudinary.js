import {v2 as cloudinary} from 'cloudinary';
//file system
import fs from 'fs'; 

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

//we will create a method where in that parameter you will give you the path of that local file then I will upload that 
//if successfully uploaded of that file then unlink that file.
const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file have been uploaded successfully
        console.log("file is uploaded on cloudinary", response.url);//this is for us now we have to return for user also hence
        return response;

        
    } catch (error) {
        //if file is uploaded unsuccessfully then catch is there, also if mistake in local file path, 
        //also if someone is using file in the cloudinary then file is in the local file server because localfilePath has come, 
        //but if it has not been uploaded yet then for a safe purpose we have to remove the file from the server to avoid 
        //malicious files , corrupted files 
        //for that there is unlink option
        fs.unlinkSync(localFilePath)//removes the locally saved temporary as the upload operation got failed
        return null
        
    }

}

export {uploadOnCloudinary}

    
    
