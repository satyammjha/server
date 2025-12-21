import { Worker } from "bullmq";
import axios from "axios";
import JobModel from "../models/Jobs.schema";
import JobEmbeddingModel from "../models/jobEmbedding.model";
import { redis } from "../queue/queue";

const EMBEDDING_API = process.env.EMBEDDING_API || ''
const API_KEY = '$dollarbabydollar$'

const jobEmbeddingWorker = new Worker(
    "embeddingQueue",
    async (job) => {
        const { jobId } = job.data;

        try {
            const jobDoc = await JobModel.findById(jobId).lean();
            if (!jobDoc) throw new Error("Job not found");

            const jobText = `
        ${jobDoc.job_title}.
        Skills: ${(jobDoc.skills || []).join(", ")}.
        Experience: ${jobDoc.experience_range || ""}.
        Location: ${jobDoc.location_string || ""}.
        Description: ${jobDoc.description || ""}
      `
                .replace(/\s+/g, " ")
                .trim();

            const { data } = await axios.post(
                EMBEDDING_API,
                { texts: [jobText] },
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

            await JobEmbeddingModel.updateOne(
                { jobId },
                {
                    $set: {
                        jobId,
                        embedding,
                        model: "all-MiniLM-L6-v2",
                        embedding_version: "minilm-v1",
                    },
                },
                { upsert: true }
            );

            await JobModel.updateOne(
                { _id: jobId },
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
            await JobModel.updateOne(
                { _id: jobId },
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

export default jobEmbeddingWorker;