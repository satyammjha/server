import { Worker } from "bullmq";
import axios from "axios";
import UserModel from "../models/user.model";
import UserEmbeddingModel from "../models/userEmbedding.model";
import userPreferencesModel from "../models/userPreferences.model";
import { buildUserEmbeddingText } from "../utils/buildUserEmbeddingPayload";
import { redis } from "../queue/queue";

const EMBEDDING_API = process.env.EMBEDDING_API || "";
const API_KEY = "$dollarbabydollar$";


const userEmbeddingWorker = new Worker(
    "userEmbeddingQueue",
    async (job) => {
        const { userId } = job.data;

        try {
            const user = await UserModel.findById(userId).lean();

            if (!user) {
                throw new Error("User not found");
            }

            let userPreference = await userPreferencesModel
                .findOne({ userId })
                .lean();
            if (!userPreference) {

                userPreference = await userPreferencesModel.create({
                    userId,
                    skills: [],
                    preferred_roles: [],
                    location: [],
                });
            }

            const userText = buildUserEmbeddingText(userPreference);

            console.log("🌐 Calling embedding API...");
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

            console.log("📡 Embedding API response received");

            const embedding = data.embeddings?.[0];
            if (!embedding) {
                console.error("❌ No embedding returned from API:", data);
                throw new Error("No embedding returned");
            }


            console.log("💾 Saving embedding to UserEmbeddingModel...");
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

            console.log("🛠 Updating user embedding flags...");
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

            console.log("🎉 embedding completed successfully for user:", userId);
            return true;
        } catch (err: any) {
            console.error("🔥 Error in embedding worker for user:", userId);
            console.error(err?.message || err);

            console.log("↩️ Resetting embedding_queued flag...");
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