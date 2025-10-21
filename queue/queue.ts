import { Queue } from 'bullmq';
import dotenv from "dotenv";
dotenv.config();

const redisConfig = {
  connection: {
    host: '43.204.255.255',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    password: 'dollar$babydollar$'
  },
};

const resumeQueue = new Queue("resumeQueue", redisConfig);

resumeQueue.on('error', (err) => {
  console.error('Queue Error:', err);
});

export default resumeQueue;