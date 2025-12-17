import { createBullBoard } from "bull-board";
import { BullMQAdapter } from "bull-board/bullMQAdapter.js";
import express from "express";
import { resumeQueue, embeddingQueue } from "./queue";

const { router } = createBullBoard([
    new BullMQAdapter(resumeQueue),
    new BullMQAdapter(embeddingQueue),
]);

export default router;