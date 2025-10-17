import { Queue } from 'bullmq';
import dotenv from "dotenv";
dotenv.config();

const redisConfig = {
  connection: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  },
};

const resumeQueue = new Queue("resumeQueue", redisConfig);

resumeQueue.on('error', (err) => {
  console.error('Queue Error:', err);
});

export default resumeQueue;