import { Queue } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const connection = new IORedis("rediss://default:AaP-AAIncDE1ZDc4OGZjZTE4MDU0Y2E0ODExNzcxMjBkNmY2MTQzYXAxNDE5ODI@crucial-piglet-41982.upstash.io:6379"
  , {
    maxRetriesPerRequest: null,
  });

export const resumeQueue = new Queue("resumeQueue", {
  connection,
});

export const embeddingQueue = new Queue("embeddingQueue", {
  connection,
});

export const userEmbeddingQueue = new Queue("userEmbeddingQueue", {
  connection,
});