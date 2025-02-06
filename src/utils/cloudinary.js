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
        fs.unlinkSync(localFilePath);
        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath); //removing the temporarily saved local file since the upload operation had failed.
        return null;
    }
}

const deleteFromCloudinary = async (cloudinaryURL) =>{
    try {
        if(cloudinaryURL.length === 0) return "Nothing to delete";
        if(!cloudinaryURL) return null;
        const pathArr = cloudinaryURL.split("/");
        const fileNameArr = pathArr[pathArr.length - 1].split(".");
        const fileName = fileNameArr[0];
        const response = await cloudinary.uploader.destroy(fileName);
    
        if (response.result === 'ok') {
            return {
              success: true,
              message: `File ${fileName} deleted successfully`
            };
        }
        else {
            throw new Error(`Failed to delete the file`);
          }
    } catch (error) {
        return false;
    }
}
export {uploadOnCloudinary, deleteFromCloudinary};