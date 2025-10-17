import { createBullBoard } from "bull-board";
import { BullAdapter } from "bull-board/bullAdapter.js";
import express from "express";
import resumeQueue from "./queue";

const { router } = createBullBoard([
    new BullAdapter(resumeQueue)
]);

export default router;