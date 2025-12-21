import { createBullBoard } from "bull-board";
import { BullMQAdapter } from "bull-board/bullMQAdapter.js";
import express from "express";
import { resumeQueue, embeddingQueue, userEmbeddingQueue } from "./queue";

const { router } = createBullBoard([
    new BullMQAdapter(resumeQueue),
    new BullMQAdapter(embeddingQueue),
    new BullMQAdapter(userEmbeddingQueue),
]);

export default router;