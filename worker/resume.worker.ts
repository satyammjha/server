import { Worker } from "bullmq";
import { redis } from '../queue/queue'
import { analysisPrompt } from "../utils/prompt/resumePrompt.utils";
import callGroq from "../utils/grok.utils";
import User from "../models/user.model";
import ResumeReviewModel from "../models/resumeReview.models";

const resumeWorker = new Worker("resumeQueue",
    async (job) => {
        const { userId, resumeText } = job.data;
        const prompt = analysisPrompt(resumeText);
        try {
            console.log("Sending prompt:", prompt);
            await ResumeReviewModel.findOneAndUpdate({ userId: userId }, { status: "processing" }, { upsert: true });
            const result = await callGroq(prompt);
            console.log("Result from groq:", result);

            const user = await User.findById(userId);
            if (user) {
                user.aiCredits -= 20;
                await user.save();
            }

            await ResumeReviewModel.findOneAndUpdate(
                { userId: userId },
                { ...result, status: "completed" },
                { upsert: true, new: true }
            );

        } catch (error) {
            console.log("Error in resumeText", error);
            await ResumeReviewModel.findOneAndUpdate(
                { userId: userId },
                { status: "failed" },
                { upsert: true, new: true }
            );
        }
    },
    {
        connection: redis,
        concurrency: 1
    }
);

export default resumeWorker;