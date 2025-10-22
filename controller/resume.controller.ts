import type { Request, Response } from "express";
import User from "../models/user.model";
import { extractText } from "../utils/fileParser";
import resumeQueue from "../queue/queue";
import ResumeDump from "../models/resumeDump.model";
import ResumeReviewModel from "../models/resumeReview.models";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import os from "os";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

const resumeReview = async (req: AuthenticatedRequest, res: Response) => {
  let tempFilePath: string | null = null;

  try {
    const userId = (req as any).userId;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const aiCredits = (user as any).aiCredits;

    if (typeof aiCredits !== "number") {
      return res.status(500).json({ message: "Invalid user data: aiCredits missing or invalid" });
    }

    if (aiCredits < 20) {
      return res.status(403).json({ message: "Insufficient AI credits" });
    }
    const tempDir = path.join(os.tmpdir(), 'resume-uploads');
    await fs.mkdir(tempDir, { recursive: true });

    const timestamp = Date.now();
    const fileExt = path.extname(req.file.originalname);
    const tempFileName = `resume-${userId}-${timestamp}${fileExt}`;
    tempFilePath = path.join(tempDir, tempFileName);

    await fs.writeFile(tempFilePath, req.file.buffer);

    const parsedText = await extractText({
      ...req.file,
      path: tempFilePath
    });

    const resumeText = typeof parsedText === 'string'
      ? parsedText
      : parsedText?.toString('utf8');

    await resumeQueue.add(
      "resumeQueue",
      {
        userId: userId.toString(),
        resumeText: resumeText
      },
      {
        attempts: 3,
        backoff: 5000
      }
    );


    await ResumeDump.findOneAndUpdate(
      { userId },
      { resumeText: resumeText },
      { upsert: true, new: true }
    );

    if (tempFilePath) {
      await fs.unlink(tempFilePath).catch(err =>
        console.error('Failed to delete temp file:', err)
      );
    }

    res.status(200).json({ message: "Resume added to AI queue" });
  } catch (err) {
    if (tempFilePath) {
      await fs.unlink(tempFilePath).catch(cleanupErr =>
        console.error('Failed to delete temp file on error:', cleanupErr)
      );
    }

    res.status(500).json({ message: (err as Error).message });
  }
};

const getResume = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = (req as any).userId;
    console.log("Fetching resume for userId:", userId);

    const user = await User.findById({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resumeReview = await ResumeReviewModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!resumeReview) {
      return res.status(404).json({ message: "Resume review not found" });
    }

    res.status(200).json({ resumeReview });
  } catch (error) {

  }
}
export { resumeReview, getResume };