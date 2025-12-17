import { Queue } from "bullmq";
import dotenv from "dotenv";
dotenv.config();

export const redisConnection = {
  host: "127.0.0.1",
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  password: "dollar$babydollar$",
};

export const resumeQueue = new Queue("resumeQueue", {
  connection: redisConnection,
});

export const embeddingQueue = new Queue("embeddingQueue", {
  connection: redisConnection,
});
