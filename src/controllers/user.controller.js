import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId)=>{
    
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken(); //we don't need 'await' here since the method acts synchronously
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating the tokens.")
    }

}

const registerUser = asyncHandler(async (req,res)  =>{
    const {fullName, email, username, password} = req.body;
    
    //Checking if all the required fields are sent and are not empty strings and throwing error otherwise.
    if (
        [fullName, email, username, password].some((field) => !field || field.trim() === "")
    ) {
        throw new ApiError(400, "All the fields are required");
    }

    //Checking if the database already contains some user with this username or email (i.e. user already exists) and throwing error if that is true.
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    if(existingUser){
        throw new ApiError(409, "User already exists");
    }
    
    //Getting the path of the files in variables if they are successfully uploaded. If they're not successfully uploaded, we'll get 'undefined' stored in the variables. 
    const avatarLocalPath = req.files?.avatar?.[0].path;

    // const coverImageLocalPath = req.files?.coverImage?.[0].path;
    // the above commented code also works correctly but we are using the following alternative for now

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    //throwing error if 'avatar' is not provided 
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath); //here if coverImageLocalPath is 'undefined' then the function would return 'null' value, which is later being handled while creating databse entry

    if(!avatar){
        throw new ApiError(500, "Internal server error!");
    }

    //creating entry in the database
    const userEntry = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", //setting coverImage's value to empty string in case, it's value is 'null'.
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(userEntry._id).select(
        "-password -refreshToken"
    )//removing password nad refreshtoken from the response
    
    //checking if the user's entry has successfully been created in the database.
    if(!createdUser){
        throw new ApiError(500, "Internal server error! XYZ");
    }

    //sending the response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully!")
    )

})

const loginUser = asyncHandler(async (req,res)=>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, username, password} = req.body;

    if(!username && !email){
        throw new ApiError(400, "Username or Email is required!")
    }

    const user = await User.findOne({
        $or : [{ email }, { username }]
    })

    if(!user){
        throw new ApiError(404, "User does not exist"); 
    }

    const passwordCheck = await user.isPasswordCorrect(password);

    if(!passwordCheck){
        throw new ApiError(401, "Incorrect password!"); 
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {user: loggedInUser, accessToken, refreshToken},
            "User has logged in!"
        )
    )
})

export {registerUser, loginUser};