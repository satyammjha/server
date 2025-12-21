import mongoose from "mongoose";

const UserEmbeddingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true,
            index: true,
        },
        embedding: {
            type: [Number],
            required: true,
        },
        model: {
            type: String,
            default: "all-MiniLM-L6-v2",
        },
        embedding_version: {
            type: String,
            default: "minilm-v1",
        },
    },
    { timestamps: true }
);

export default mongoose.model("UserEmbedding", UserEmbeddingSchema);