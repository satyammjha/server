import { Request, Response } from "express";
import JobModel from "../models/Jobs.schema";
import { embeddingQueue } from "../queue/queue";

const embed = async (req: Request, res: Response) => {
    console.log("[embed] started");

    try {
        const jobs = await JobModel.find(
            { embedding_queued: { $ne: true } },
            { _id: 1 }
        ).lean();

        console.log("[embed] jobs found:", jobs.length);

        if (!jobs.length) {
            console.log("[embed] no jobs to queue");
            return res.status(200).json({
                message: "No jobs pending for embedding",
                queued: 0,
            });
        }

        const jobIds = jobs.map(j => j._id);

        await JobModel.updateMany(
            { _id: { $in: jobIds } },
            { $set: { embedding_queued: true } }
        );

        console.log("[embed] jobs marked as embedding_queued");

        for (const jobId of jobIds) {
            await embeddingQueue.add(
                "generate-embedding",
                { jobId },
                {
                    attempts: 3,
                    backoff: { type: "exponential", delay: 5000 },
                }
            );
        }

        console.log(`[embed] queued ${jobIds.length} jobs`);

        return res.status(200).json({
            message: "Jobs queued for embedding",
            queued: jobIds.length,
        });
    } catch (error) {
        console.error("[embed] error:", error);
        return res.status(500).json({
            message: "Failed to queue jobs for embedding",
        });
    }
};

export default embed;