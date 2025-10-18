import { SavedJobModel } from "../models/SavedJobs.model";
import type { Request, Response } from "express";
import User from "../models/user.model";
import JobModel from "../models/Jobs.schema";
import mongoose from "mongoose";

export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const allJobs = await JobModel.find({});
    res.status(200).json({ count: allJobs.length, allJobs });
  }
  catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
}

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
      return res.status(400).json({ message: "UserId is required" });
    }

    const savedJobs = await SavedJobModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },

      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "jobDetails"
        }
      },

      { $unwind: "$jobDetails" },
      { $sort: { savedAt: -1 } },
    ]);
    if (!savedJobs?.length) {
      return res.status(404).json({ message: "No saved jobs found" });
    }
    res.status(200).json({
      count: savedJobs.length,
      savedJobs
    });
  } catch (err) {
    console.error("Error in getSavedJobs:", err);
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

export const updateJobStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { jobId, status } = req.body;
    if (!userId || !jobId || !status) {
      return res.status(400).json({ message: "userId, jobId and status are required" });
    }
    const savedJob = await SavedJobModel.findOne({ userId, jobId });
    if (!savedJob) {
      return res.status(404).json({ message: "Saved job not found" });
    }
    savedJob.status = status;
    await savedJob.save();
    res.status(200).json({ message: "Job status updated successfully", savedJob });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
}