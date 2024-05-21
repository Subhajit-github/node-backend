import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler( async (req, res) => {
    //get user details from front-end
    const { fullName, userName, email, password } = req.body;
    console.log("email: ", email);
    //validation - not empty
    if ([fullName, userName, email, password].some((field) => 
        field?.trim() === "")) {
        throw new ApiError(400, "Please fill in all fields");
    }
    //check if user already exists: username, email
    const existedUser = User.findOne({
        $or: [{ userName }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }
    //check for images, avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImagelocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Please upload avatar and cover image")
    }
    //upload to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath, "avatar");
    
    if(coverImagelocalPath){
        const coverImage = await uploadOnCloudinary(coverImagelocalPath, "coverImage");
    }
    if (!avatar) {
        throw new ApiError(500, "Failed to upload image")
    }
    //create user object and create entry to database
    const user = await User.create({
        fullName,
        userName: userName.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })
    //remove password and refresh token from response
    //check for user creation
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Failed to create user")
    }
    //return response
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered Successfully"))
})

export { registerUser }