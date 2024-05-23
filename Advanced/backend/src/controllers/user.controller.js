import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        //find user
        const user = await User.findById(userId);
        //generate access token
        const accessToken = user.generateAccessToken();
        //generate refresh token
        const refreshToken = user.generateRefreshToken();
        //save refresh token to database
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        //return response
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Failed to generate tokens")
    }
}
const registerUser = asyncHandler( async (req, res) => {
    //get user details from front-end
    const { fullName, userName, email, password } = req.body;

    //validation - not empty
    if ([fullName, userName, email, password].some((field) => 
        field?.trim() === "")) {
        throw new ApiError(400, "Please fill in all fields");
    }
    //check if user already exists: username, email
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }
    //check for images, avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;

    let coverImagelocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImagelocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Please upload avatar")
    }
    //upload to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log(avatar);
    
    const coverImage = await uploadOnCloudinary(coverImagelocalPath);
    console.log(coverImage);


    if (!avatar) {
        throw new ApiError(400, "Avatar File is required")
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

const loginUser = asyncHandler( async (req, res) => {
    //get data from request body
    const { userName, email, password } = req.body;
    //validate username and email
    if (!username && !email) {
        throw new ApiError(400, "Username or email is required")
    }
    //validate password
    //find user in DB
    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (!user) {
        throw new ApiError(401, "User does not exist")
    }
    //check password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Password")
    }
    //access and refresh token
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    //send secure cookie
    const options = {
        httpOnly: true,
        secure: true
    }
    //send response
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
        200,
        {
            user: loggedInUser, accessToken, refreshToken
        },
            "User logged in successfully"))
})

const logoutUser = asyncHandler( async (req, res) => {
    //get user details and update
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            //get new updated value in response
            new: true
        },

    )

    const options = {
        httpOnly: true,
        secure: true
    }
    //send response
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})
export { 
    registerUser, 
    loginUser,
    logoutUser
}