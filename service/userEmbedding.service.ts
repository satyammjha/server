import { Worker } from "bullmq";
import axios from "axios";
import UserModel from "../models/user.model";
import UserEmbeddingModel from "../models/userEmbedding.model";
import userPreferencesModel from "../models/userPreferences.model";
import { buildUserEmbeddingText } from "../utils/buildUserEmbeddingPayload";
import ResumeReviewModel from "../models/resumeReview.models";
import { redis } from "../queue/queue";

type EmbeddingUserPreferences = {
    userId: any;
    skills_manual: string[];
    skills_from_resume: string[];
    merged_skills: string[];
    preferred_roles: string[];
    location: string[];
};


const EMBEDDING_API = process.env.EMBEDDING_API || "";
const API_KEY = "$dollarbabydollar$";

const userEmbeddingWorker = new Worker(
    "userEmbeddingQueue",
    async (job) => {
        const { userId } = job.data;

        try {
            const user = await UserModel.findById(userId).lean();
            if (!user) throw new Error("User not found");

            let userPreference: EmbeddingUserPreferences | null =
                await userPreferencesModel.findOne({ userId }).lean();


            if (!userPreference) {
                await userPreferencesModel.create({
                    userId,
                    skills_manual: [],
                    skills_from_resume: [],
                    merged_skills: [],
                    preferred_roles: [],
                    location: [],
                });

                userPreference = {
                    userId,
                    skills_manual: [],
                    skills_from_resume: [],
                    merged_skills: [],
                    preferred_roles: [],
                    location: [],
                };

            }

            const resumeReview = await ResumeReviewModel
                .findOne({ userId })
                .sort({ reviewedAt: -1 })
                .lean();

            const userText = buildUserEmbeddingText({
                preferences: userPreference,
                resume: resumeReview,
            });

            if (!userText || userText.length < 5) {
                console.warn("⚠️ Skipping embedding (no usable data):", userId);

                await UserModel.updateOne(
                    { _id: userId },
                    { $set: { embedding_queued: false } }
                );

                return true;
            }

            console.log("🧠 Generating embedding:", userId);

            const { data } = await axios.post(
                EMBEDDING_API,
                { texts: [userText] },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": API_KEY,
                    },
                    timeout: 15000,
                }
            );

            const embedding = data.embeddings?.[0];
            if (!embedding) throw new Error("No embedding returned");

            await UserEmbeddingModel.updateOne(
                { userId },
                {
                    $set: {
                        userId,
                        embedding,
                        model: "all-MiniLM-L6-v2",
                        embedding_version: "minilm-v1",
                    },
                },
                { upsert: true }
            );

            await UserModel.updateOne(
                { _id: userId },
                {
                    $set: {
                        is_embedded: true,
                        embedding_queued: false,
                        embedded_at: new Date(),
                    },
                }
            );

            console.log("✅ Embedding completed:", userId);
            return true;
        } catch (err: any) {
            console.error("❌ Embedding worker failed:", userId, err?.message);

            await UserModel.updateOne(
                { _id: userId },
                { $set: { embedding_queued: false } }
            );

            throw err;
        }
    },
    {
        connection: redis,
        concurrency: 2,
    }
);

export default userEmbeddingWorker;