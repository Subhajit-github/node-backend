import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as jwt from 'jsonwebtoken';

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
        const response = await user.save({validateBeforeSave: false});
        //return response
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Failed to generate tokens")
    }
}
const registerUser = asyncHandler( async (req, res) => {
    //get user details from front-end
    const { fullName, username, email, password } = req.body;

    //validation - not empty
    if ([fullName, username, email, password].some((field) => 
        field?.trim() === "")) {
        throw new ApiError(400, "Please fill in all fields");
    }
    //check if user already exists: username, email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
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
        username: username.toLowerCase(),
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
    const { username, email, password } = req.body;
    //validate username and email
    if (!username && !email) {
        throw new ApiError(400, "Username and email is required")
    }
    //validate password
    //find user in DB
    const user = await User.findOne({
        $or: [{ username }, { email }]
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

const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || request.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request")
    }

    try {
            const decodedRefreshToken = jwt.verify(
                incomingRefreshToken, 
                process.env.REFRESH_TOKEN_SECRET
            );
            //verify refresh token
            const user = await user.findById(decodedRefreshToken._id)
            if (!user) {
                throw new ApiError(401, "Unauthorized Request")
            }
        
            if (incomingRefreshToken !== user?.refreshToken) {
                throw new ApiError(401, "Refresh token is expired or used")
            }
        
            const options = {
                httpOnly: true,
                secure: true
            }
        
            const { accessToken, newRefreshToken} = generateAccessAndRefreshTokens(user._id)
        
            return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, tokens, "Access token refreshed successfully"))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})

const changeCurrentPassword = asyncHandler( async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(currentPassword);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Password")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler( async (req, res) => {
    return res
    .status(200)
    .json(200, req.user, "User fetched successfully")
})

const updateAccountDetails = asyncHandler( async (req, res) => {
    const { fullName, email} = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "Please fill in all fields")
    } 

    const user = await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                fullName,
                email: email
            }
    }, {
        new: true //Return updated information
    }).select("-password -refreshToken")

    return res.status(200)
    .json(new ApiResponse(200, user, "Account Details updated successfully"))
})

const updateUserAvatar = asyncHandler( async (req, res) => {
    const avatarLocalPath = req.file?.path; 

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is messing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading Avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
    }, {
        new: true //Return updated information
    }).select("-password")

    return res.status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler( async (req, res) => {
    const coverImageLocalPath = req.file?.path; 

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image is messing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading Cover Image")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: coverImage.url
            }
    }, {
        new: true //Return updated information
    }).select("-password")

    return res.
    status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully"))
})
export { 
    registerUser, 
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}