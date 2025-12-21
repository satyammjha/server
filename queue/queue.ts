import { Queue } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redis = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

export const resumeQueue = new Queue("resumeQueue", {
  connection: redis,
});

export const embeddingQueue = new Queue("embeddingQueue", {
  connection: redis,
});

export const userEmbeddingQueue = new Queue("userEmbeddingQueue", {
  connection: redis,
});