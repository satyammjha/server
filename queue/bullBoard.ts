import { createBullBoard } from "bull-board";
import { BullMQAdapter } from "bull-board/bullMQAdapter.js";
import express from "express";
import { resumeQueue } from "./queue";

const { router } = createBullBoard([
    new BullMQAdapter(resumeQueue)
]);

export default router;