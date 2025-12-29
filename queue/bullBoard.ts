import { createBullBoard } from "bull-board";
import { BullMQAdapter } from "bull-board/bullMQAdapter.js";
import express from "express";
import { resumeQueue, embeddingQueue, userEmbeddingQueue, jobNotificationQueue } from "./queue";

const { router } = createBullBoard([
    new BullMQAdapter(resumeQueue),
    new BullMQAdapter(embeddingQueue),
    new BullMQAdapter(userEmbeddingQueue),
    new BullMQAdapter(jobNotificationQueue),
]);

export default router;