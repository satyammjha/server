import mongoose from "mongoose";

const resumeDumpSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resumeText: { type: String, required: true },
    resumeStatus: { type: String, enum: ["pending", "processed", "failed"], default: "pending" },
});

const ResumeDump = mongoose.model("resumeDump", resumeDumpSchema);

export default ResumeDump;