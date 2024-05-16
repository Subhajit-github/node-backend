import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    userName: { 
        type: String, 
        required: true,
        lowercase: true,
        unique: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true 
    },
    password: { 
        type: String, 
        required: [true, "Password is required"]
    },
    isActive: { 
        type: Boolean,  
        required: true 
    },
}, 
{
    timestamps: true
})

export const User = mongoose.model('User', userSchema)