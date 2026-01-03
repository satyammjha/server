import { Worker } from "bullmq";
import { redis } from "../queue/queue";
import { sendEmail } from "../utils/sendEmail.utils";
import { jobListTemplate } from "../utils/templates/job.template";

const embeddingMissingTemplate = ({ name }: { name: string }) => `
<div style="font-family: Arial, sans-serif; line-height: 1.5">
  <h2>Hi ${name},</h2>
  <p>You haven’t set up your job preferences yet.</p>
  <p>Update your job filters to receive the best matching jobs.</p>
  <a href="https://zobly.in/matches"
     style="display:inline-block; padding:10px 16px; background:#2563eb; color:#fff; text-decoration:none; border-radius:4px;">
     Update Preferences
  </a>
</div>
`;

console.log("[Worker] 🛠️ NotificationWorker initialized and listening...");

export const NotificationWorker = new Worker(
    "jobNotificationQueue",
    async (job) => {
        const jobId = job.id;
        const jobName = job.name;


        try {
            if (jobName === "job-notification") {
                const { emailId, name, jobs } = job.data;

                if (!emailId || !Array.isArray(jobs) || jobs.length === 0) {
                    console.error(`[Worker] ❌ ABORT: Invalid payload. Email or Jobs missing.`);
                    throw new Error("Invalid job-notification payload");
                }

                console.log(`[Worker] 🎨 Generating HTML template for ${name}...`);

                const html = jobListTemplate({
                    name: name ?? "there",
                    jobs,
                });
                await sendEmail(emailId, name ?? "there", html);

                console.log(`[Worker] ✅ DONE: Job Notification sent to ${emailId}`);
                return { sent: true };
            }

            if (jobName === "embedding-missing") {
                const { emailId, name } = job.data;

                console.log(`[Worker] 🔍 Payload Check: Email=${emailId} (Embedding Missing)`);

                if (!emailId) {
                    console.error(`[Worker] ❌ ABORT: Missing emailId in payload.`);
                    throw new Error("Invalid embedding-missing payload");
                }

                const html = embeddingMissingTemplate({
                    name: name ?? "there",
                });

                await sendEmail(emailId, name ?? "there", html);

                console.log(`[Worker] ✅ DONE: Embedding warning sent to ${emailId}`);
                return { sent: true };
            }

            console.warn(`[Worker] ⚠️ SKIPPED: Unknown job name '${jobName}'`);
            return { ignored: true };

        } catch (error) {
            console.error(`[Worker] 💥 CRITICAL FAILURE in Job ${jobId}:`);
            console.error(error);
            throw error;
        }
    },
    {
        connection: redis,
        concurrency: 1,
    }
);

NotificationWorker.on("completed", (job) => {
    console.log(`[Worker Event] 🎉 Job ${job.id} has completed!`);
});
NotificationWorker.on("failed", (job, err) => {
    console.error(`[Worker Event] 💀 Job ${job?.id} has failed with ${err.message}`);
});
NotificationWorker.on("error", (err) => {
    console.error(`[Worker Event] 🔌 Redis/Connection Error: ${err.message}`);
});