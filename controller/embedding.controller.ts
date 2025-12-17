import JobModel from "../models/Jobs.schema";
import { embeddingQueue } from "../queue/queue";

const embed = async () => {
    try {
        const jobs = await JobModel.find(
            {
                $or: [
                    { is_embedded: false },
                    { is_embedded: { $exists: false } }
                ],
                embedding_queued: { $ne: true }
            },
            { _id: 1 }
        ).lean();

        if (!jobs.length) return;

        const jobIds = jobs.map(j => j._id);

        await JobModel.updateMany(
            { _id: { $in: jobIds } },
            { $set: { embedding_queued: true } }
        );

        for (const jobId of jobIds) {
            await embeddingQueue.add(
                "generate-embedding",
                { jobId },
                {
                    attempts: 3,
                    backoff: { type: "exponential", delay: 5000 }
                }
            );
        }

        console.log(`Queued ${jobIds.length} jobs for embedding`);
    } catch (error) {
        console.error("Error during embedding queue", error);
    }
};

export default embed;