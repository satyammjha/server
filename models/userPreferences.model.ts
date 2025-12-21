import mongoose from "mongoose";

const UserPreferencesSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true,
            index: true,
        },

        skills_manual: {
            type: [String],
            default: [],
        },

        skills_from_resume: {
            type: [String],
            default: [],
        },

        merged_skills: {
            type: [String],
            default: [],
            index: true,
        },


        experience_years: {
            type: Number,
            min: 0,
        },

        experience_level: {
            type: String,
            enum: ["fresher", "junior", "mid", "senior"],
        },

        preferred_roles: {
            type: [String],
            default: [],
        },

        preferred_job_type: {
            type: [String],
            enum: ["full-time", "part-time", "internship", "contract", "remote"],
            default: [],
        },

        location: {
            type: [String],
        },

        open_to_remote: {
            type: Boolean,
            default: true,
        },

        expected_salary_min: {
            type: Number,
        },

        expected_salary_max: {
            type: Number,
        },

        salary_currency: {
            type: String,
            default: "INR",
        },

        resume_uploaded_at: {
            type: Date,
        },

        resume_source: {
            type: String,
            enum: ["user_upload", "linkedin", "indeed"],
        },

        embedding_queued: {
            type: Boolean,
            default: false,
        },

        is_embedded: {
            type: Boolean,
            default: false,
        },

        embedded_at: {
            type: Date,
        },

        embedding_version: {
            type: String,
            default: "user-v1",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("UserPreferences", UserPreferencesSchema);