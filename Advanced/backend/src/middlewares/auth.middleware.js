import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler( async (req, res, next) => {
    console.log(" in verifyJWT");
    try {
        const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer ", "")
        console.log("token: ", token);
        if (!token) {
            throw new ApiError(400, {
                message: "Unauthorized"
            })
        }
    
        //verify JWT Token
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        //get user ID
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
    
        if (!user) {
            throw new ApiError(400, {
                message: "Invalid Access Token"
            })
        }
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
        
    }
})