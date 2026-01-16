import mongoose from "mongoose";

const SavedJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    status: { type: String, default: 'saved' },
    aiScore: Number,
    comment: String,
  },

  { timestamps: true }
);

SavedJobSchema.index({ jobId: 1 });
export const SavedJobModel = mongoose.model("SavedJob", SavedJobSchema);