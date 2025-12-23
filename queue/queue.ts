import { Queue } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redis = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
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