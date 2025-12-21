import { Worker } from "bullmq";
import axios from "axios";
import UserModel from "../models/user.model";
import UserEmbeddingModel from "../models/userEmbedding.model";
import { buildUserEmbeddingText } from "../utils/buildUserEmbeddingPayload";
import { connection } from "../queue/queue";

const EMBEDDING_API = process.env.EMBEDDING_API || ''
const API_KEY = "$dollarbabydollar$";

const userEmbeddingWorker = new Worker(
    "userEmbeddingQueue",
    async (job) => {
        const { userId } = job.data;

        try {
            const user = await UserModel.findById(userId).lean();
            if (!user) throw new Error("User not found");

            const userText = buildUserEmbeddingText(user);

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

            return true;
        } catch (err) {
            await UserModel.updateOne(
                { _id: userId },
                { $set: { embedding_queued: false } }
            );
            throw err;
        }
    },
    {
        connection,
        concurrency: 2,
    }
);

export default userEmbeddingWorker;