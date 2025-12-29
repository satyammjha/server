import { NotificationPreferenceModel } from "../models/notificationPreference.model";
import { jobNotificationQueue } from "../queue/queue";
import {
    getTopJobMatchesForUser,
    EmbeddingMissingError,
} from "../service/match.service";

export const AddToNotificationQueue = async () => {
    try {
        const users = await NotificationPreferenceModel.find(
            { isJobEmailSend: false },
            { emailId: 1, userId: 1, name: 1 }
        ).limit(50).lean();

        console.log(`[Queue] Users fetched: ${users.length}`);

        for (const user of users) {
            if (!user.emailId || !user.userId) continue;

            try {
                const matches = await getTopJobMatchesForUser(
                    user.userId.toString(),
                    5
                );

                if (!matches.length) continue;

                await jobNotificationQueue.add(
                    "job-notification",
                    {
                        emailId: user.emailId,
                        name: user.name ?? "there",
                        jobs: matches.map(m => ({
                            id: m.job._id.toString(),
                            title: m.job.job_title,
                            score: Math.round(m.score * 100),
                            location:
                                m.job.location_string ||
                                (Array.isArray(m.job.locations)
                                    ? m.job.locations.join(", ")
                                    : ""),
                            salary: m.job.hide_salary
                                ? undefined
                                : `${m.job.min_salary}-${m.job.max_salary} ${m.job.salary_currency}`,
                            url: m.job.apply_url,
                        })),
                    },
                    {
                        jobId: `${user.emailId}-job-matches`,
                        attempts: 3,
                        backoff: { type: "exponential", delay: 5000 },
                        removeOnComplete: true,
                        removeOnFail: 100,
                    }
                );

                await NotificationPreferenceModel.updateOne(
                    { _id: user._id },
                    { $set: { isJobEmailSend: true } }
                );

                console.log(`[Queue] Job queued for ${user.emailId}`);
            } catch (err) {
                if (err instanceof EmbeddingMissingError) {
                    await jobNotificationQueue.add(
                        "embedding-missing",
                        {
                            emailId: user.emailId,
                            name: user.name ?? "there",
                        },
                        {
                            jobId: `${user.emailId}-embedding-missing`,
                            attempts: 1,
                            removeOnComplete: true,
                        }
                    );

                    await NotificationPreferenceModel.updateOne(
                        { _id: user._id },
                        { $set: { isJobEmailSend: true } }
                    );

                    console.log(`[Queue] Embedding-missing queued for ${user.emailId}`);
                }
            }
        }
    } catch (err) {
        console.error("[AddToNotificationQueue]", err);
    }
};