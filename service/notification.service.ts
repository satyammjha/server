import { Worker } from "bullmq";
import { redis } from "../queue/queue";
import { sendEmail } from "../utils/sendEmail.utils";
import { jobListTemplate } from "../utils/templates/job.template";

const embeddingMissingTemplate = ({ name }: { name: string }) => `
<div style="font-family: Arial, sans-serif; line-height: 1.5">
  <h2>Hi ${name},</h2>

  <p>You haven’t set up your job preferences yet.</p>

  <p>Update your job filters to receive the best matching jobs.</p>

  <a href="https://zobly.in/preferences"
     style="
       display:inline-block;
       padding:10px 16px;
       background:#2563eb;
       color:#fff;
       text-decoration:none;
       border-radius:4px;
     ">
     Update Preferences
  </a>
</div>
`;

export const NotificationWorker = new Worker(
    "jobNotificationQueue",
    async (job) => {
        try {
            if (job.name === "job-notification") {
                const { emailId, name, jobs } = job.data;

                if (!emailId || !Array.isArray(jobs) || jobs.length === 0) {
                    throw new Error("Invalid job-notification payload");
                }

                const html = jobListTemplate({
                    name: name ?? "there",
                    jobs,
                });

                await sendEmail(emailId, name ?? "there", html);
                return { sent: true };
            }

            if (job.name === "embedding-missing") {
                const { emailId, name } = job.data;

                if (!emailId) {
                    throw new Error("Invalid embedding-missing payload");
                }

                const html = embeddingMissingTemplate({
                    name: name ?? "there",
                });

                await sendEmail(emailId, name ?? "there", html);
                return { sent: true };
            }

            return { ignored: true };
        } catch (error) {
            console.error("[NotificationWorker]", error);
            throw error;
        }
    },
    {
        connection: redis,
        concurrency: 1,
    }
);