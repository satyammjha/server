import { Request, Response } from "express";
import UserEmbeddingModel from "../models/userEmbedding.model";
import JobEmbeddingModel from "../models/jobEmbedding.model";
import JobModel from "../models/Jobs.schema";
import { cosineSimilarity } from "../utils/cosine.utils";

export const getJobMatches = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const userEmbeddingDoc = await UserEmbeddingModel.findOne({ userId }).lean();
        if (!userEmbeddingDoc) {
            return res.status(400).json({
                message: "User embedding not found. Please update preferences.",
            });
        }

        const userVector = userEmbeddingDoc.embedding;

        const jobs = await JobModel.find(
            { is_active: true },
            {
                title: 1,
                company: 1,
                location: 1,
                skills: 1,
                experience_range: 1,
                job_type: 1,
            }
        ).lean();

        if (!jobs.length) {
            return res.status(200).json({ count: 0, matches: [] });
        }

        const jobMap = new Map(
            jobs.map(job => [job._id.toString(), job])
        );

        const jobIds = jobs.map(job => job._id);

        const jobEmbeddings = await JobEmbeddingModel.find({
            jobId: { $in: jobIds },
        }).lean();

        const scoredJobs = jobEmbeddings.map(jobEmbed => {
            const score = cosineSimilarity(userVector, jobEmbed.embedding);
            const jobData = jobMap.get(jobEmbed.jobId.toString());

            return {
                job: jobData,
                score,
            };
        });

        const topMatches = scoredJobs
            .filter(item => item.job)
            .sort((a, b) => b.score - a.score)
            .slice(0, 30);

        return res.status(200).json({
            count: topMatches.length,
            matches: topMatches,
        });
    } catch (error) {
        console.error("[getJobMatches] error:", error);
        return res.status(500).json({
            message: "Failed to fetch job matches",
        });
    }
};