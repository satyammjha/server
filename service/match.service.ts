import UserEmbeddingModel from "../models/userEmbedding.model";
import JobEmbeddingModel from "../models/jobEmbedding.model";
import JobModel from "../models/Jobs.schema";
import { cosineSimilarity } from "../utils/cosine.utils";

export class EmbeddingMissingError extends Error {
    constructor() {
        super("USER_EMBEDDING_MISSING");
    }
}

export const getTopJobMatchesForUser = async (
    userId: string,
    limit = 5
) => {
    const userEmbeddingDoc = await UserEmbeddingModel
        .findOne({ userId })
        .lean();

    if (!userEmbeddingDoc) {
        throw new EmbeddingMissingError();
    }

    const userVector = userEmbeddingDoc.embedding;

    const jobs = await JobModel
        .find({ is_active: true })
        .lean();

    if (!jobs.length) return [];

    const jobMap = new Map(
        jobs.map(job => [job._id.toString(), job])
    );

    const jobEmbeddings = await JobEmbeddingModel.find({
        jobId: { $in: jobs.map(j => j._id) },
    }).lean();

    const scoredJobs = jobEmbeddings
        .map(embed => {
            const job = jobMap.get(embed.jobId.toString());
            if (!job) return null;

            return {
                job,
                score: cosineSimilarity(userVector, embed.embedding),
            };
        })
        .filter(
            (item): item is { job: any; score: number } => item !== null
        )
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    return scoredJobs;
};