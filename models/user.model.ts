import mongoose from "mongoose";
import { Types } from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    email: {
        type: String,
        required: false,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    aiCredits: {
        type: Number,
        default: 100
    },

    referralCode: { type: String, unique: true, sparse: true },

    referralCount: { type: Number, default: 0 },

    referredUsers: [{ type: Types.ObjectId, ref: 'User' }],

    referredBy: { type: Types.ObjectId, ref: 'User' },

    isVerified: { type: Boolean, default: false },

    savedJobs: [{ type: Object }],

    notifyAboutExpiringJobs: { type: Boolean, default: false },

    resumeUploads: { type: Number, default: 0 },

    resumeUploadTimestamp: { type: Date },

    lastRefillDate: { type: Date },

    notifications: [
        {
            message: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
            read: { type: Boolean, default: false },
        },
    ],
})

const User = mongoose.model('user', userSchema)

export default User;