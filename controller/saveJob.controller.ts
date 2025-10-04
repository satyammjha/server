import { SavedJobModel } from "../models/SavedJobs.model";
import type { Request, Response } from "express";
import User from "../models/user.model";

export const saveJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { jobId } = req.body;
    console.log("Saving job for user:", userId, "with jobId:", jobId);
    if (!jobId || !userId) {
      res.status(400).json({ message: "JobId and UserId are required" });
      return;
    }

    const user = await User.findById(userId);
    console.log("User found:", user);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const existingJob = await SavedJobModel.findOne({ userId, jobId });

    if (existingJob) {
      res.status(400).json({ message: "Job already saved" });
      return;
    }

    const newSavedJob = new SavedJobModel({ userId, jobId });
    await newSavedJob.save();
    res
      .status(201)
      .json({ message: "Job saved successfully", job: newSavedJob });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export const getSavedJobs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(400).json({ message: "UserId is required" });
      return;
    }
    const savedJobs = await SavedJobModel.find({ userId });
    if (!savedJobs) {
      res.status(404).json({ message: "No saved jobs found" });
      return;
    }
    if (savedJobs.length === 0) {
      res.status(404).json({ message: "No saved jobs found" });
      return;
    }
    res.status(200).json({ count: savedJobs.length, savedJobs });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export const deleteSavedJobs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { jobIds } = req.body;
    console.log("Deleting jobs for user:", userId, "with jobIds:", jobIds);
    if (!userId || !Array.isArray(jobIds) || jobIds.length === 0) {
      return res
        .status(400)
        .json({ message: "UserId and jobIds array are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await SavedJobModel.deleteMany({
      userId,
      jobId: { $in: jobIds },
    });

    res.status(200).json({
      count: result.deletedCount,
      message: `${result.deletedCount} job(s) deleted successfully`,
    });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};