import type { Request, Response } from "express";
import User from "../models/user.model";
import { extractText } from "../utils/fileParser";
import resumeQueue from "../queue/queue";
import ResumeDump from "../models/resumeDump.model";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

const resumeReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const user = await User.findById({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const parsedText = await extractText(req.file);
    resumeQueue.add({ userId, resumeText: parsedText },  { attempts: 3, backoff: 5000 });
    await ResumeDump.findOneAndUpdate(
      { userId },
      { resumeText: parsedText },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: "Resume added to AI queue" });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export { resumeReview };