import mongoose, { Schema } from 'mongoose';

const ResumeReviewSchema = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        overallScore: { type: Number },
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        suggestions: [{ type: String }],
        skills: [{ type: String }],
        experience: {
            yearsOfExperience: { type: String },
            level: { type: String },
            industries: [{ type: String }],
        },
        formatting: {
            score: { type: Number },
            issues: [{ type: String }],
        },
        additionalInsights: {
            strongestArea: { type: String },
            improvementPriority: { type: String },
            careerReadiness: { type: String },
            missingElements: [{ type: String }],
        },
        reviewedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const ResumeReviewModel = mongoose.model('ResumeReview', ResumeReviewSchema, 'ResumeReview');

export default ResumeReviewModel;