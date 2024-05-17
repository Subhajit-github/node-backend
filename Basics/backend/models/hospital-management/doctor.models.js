import mongoose from 'mongoose';

const hospitalList = new mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    hoursInHospital: {
        type: Number,
        required: true,
        default: 0
    }
})
const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    salary: {
        type: Number,
        required: true,
    },
    qualifications: {
        type: String,
        required: true,
    },
    experienceInYears: {
        type: Number,
        required: true,
        default: 0
    },
    worksInHospitals: {
        type: [hospitalList],
        required: true
    }
}, {timestamps: true})

export const Doctor = mongoose.model('Doctor', doctorSchema);