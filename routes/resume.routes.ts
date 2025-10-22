import express from "express";
import multer from "multer";
import { getResume, resumeReview } from "../controller/resume.controller";
import authMiddleware from "../middleware/auth";

const route = express.Router();

const upload = multer();
route.post("/review", authMiddleware, upload.single("file"), resumeReview);
route.get("/get", authMiddleware, getResume);

export default route;