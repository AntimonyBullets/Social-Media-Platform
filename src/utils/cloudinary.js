import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});// The cloudinary.config() method is used to configure the Cloudinary SDK with the necessary credentials to interact with your Cloudinary account

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" //automatically identifies the resource_type (image, video etc.) of the file uploaded
        });// for uploading the file on cloudinary
    
        console.log(`File uploaded successfully: ${response.url}`);
        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath); //removing the temporarily saved local file since the upload operation had failed.
        return null;
    }
}

export {uploadOnCloudinary};