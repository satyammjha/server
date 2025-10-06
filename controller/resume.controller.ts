import type { Request, Response } from "express";
import User from "../models/user.model";
import { extractText } from "../utils/fileParser";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

const resumeReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded"});
    }
    const user = await User.findById({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const parsedText = await extractText(req.file);

    res.status(200).json({ user: user.name, text: parsedText });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export { resumeReview };