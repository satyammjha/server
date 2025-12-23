import mongoose, { Schema, Types } from "mongoose";

interface IUser {
    name: string;
    email?: string;
    password?: string;
    username?: string;
    provider: "local" | "google" | "github";
    providerId?: string;
    avatar?: string;
    aiCredits: number;
    referralCode?: string;
    referralCount: number;
    referredUsers: Types.ObjectId[];
    referredBy?: Types.ObjectId;
    isVerified: boolean;
    savedJobs: object[];
    notifyAboutExpiringJobs: boolean;
    resumeUploads: number;
    resumeUploadTimestamp?: Date;
    lastRefillDate?: Date;
    notifications: {
        message: string;
        createdAt: Date;
        read: boolean;
    }[];
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },

        email: { type: String, unique: true, sparse: true },

        password: {
            type: String,
            required: function (this: IUser) {
                return this.provider === "local";
            },
        },

        username: { type: String, unique: true, sparse: true },

        provider: {
            type: String,
            enum: ["local", "google", "github"],
            default: "local",
        },

        providerId: { type: String, sparse: true },

        avatar: String,

        aiCredits: { type: Number, default: 100 },

        referralCode: { type: String, unique: true, sparse: true },
        referralCount: { type: Number, default: 0 },
        referredUsers: [{ type: Types.ObjectId, ref: "User" }],
        referredBy: { type: Types.ObjectId, ref: "User" },

        isVerified: { type: Boolean, default: false },

        savedJobs: [{ type: Object }],
        notifyAboutExpiringJobs: { type: Boolean, default: false },

        resumeUploads: { type: Number, default: 0 },
        resumeUploadTimestamp: Date,

        lastRefillDate: Date,

        notifications: [
            {
                message: { type: String, required: true },
                createdAt: { type: Date, default: Date.now },
                read: { type: Boolean, default: false },
            },
        ],
    },
    { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;