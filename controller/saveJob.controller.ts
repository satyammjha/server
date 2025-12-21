import { SavedJobModel } from "../models/SavedJobs.model";
import type { Request, Response } from "express";
import User from "../models/user.model";
import JobModel from "../models/Jobs.schema";
import mongoose from "mongoose";
import { redis } from '../queue/queue'

export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const CACHE_KEY = "all_jobs:v1";
    const CACHE_TTL = 600;

    const cachedJobs = await redis.get(CACHE_KEY);
    if (cachedJobs) {
      console.log("[getAllJobs] cache HIT");
      const jobs = JSON.parse(cachedJobs);
      return res.status(200).json({
        count: jobs.length,
        allJobs: jobs,
        source: "cache",
      });
    }

    console.log("[getAllJobs] cache MISS");

    const allJobs = await JobModel.find({});

    await redis.set(
      CACHE_KEY,
      JSON.stringify(allJobs),
      "EX",
      CACHE_TTL
    );

    return res.status(200).json({
      count: allJobs.length,
      allJobs,
      source: "db",
    });
  } catch (err) {
    console.error("[getAllJobs] error:", err);
    return res.status(500).json({
      message: (err as Error).message,
    });
  }
};


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
      { $sort: { updatedAt: -1 } },
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
    let { jobIds } = req.body;

    console.log("🟡 [DELETE] Request received to delete saved jobs");
    console.log("➡️ User ID:", userId);
    console.log("➡️ Job IDs from body:", jobIds);

    if (!Array.isArray(jobIds)) {
      console.log("ℹ️ jobIds is not an array. Converting to array...");
      jobIds = [jobIds];
    }

    if (!userId || !Array.isArray(jobIds) || jobIds.length === 0) {
      console.error("❌ Missing userId or empty jobIds array");
      return res
        .status(400)
        .json({ message: "UserId and jobIds array are required" });
    }

    console.log("🔍 Checking if user exists...");
    const user = await User.findById(userId);

    if (!user) {
      console.error("❌ User not found in DB:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("🗑️ Attempting to delete jobs...");
    const result = await SavedJobModel.deleteMany({
      userId,
      jobId: { $in: jobIds },
    });

    console.log("✅ Delete operation completed");
    console.log("➡️ Matched Count (approx):", jobIds.length);
    console.log("➡️ Deleted Count:", result.deletedCount);

    if (result.deletedCount === 0) {
      console.warn("⚠️ No jobs were deleted. Possible invalid jobIds or already removed.");
    }
    const allSavedJobs = await SavedJobModel.aggregate([
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
      { $sort: { updatedAt: -1 } },
    ]);

    res.status(200).json({
      count: result.deletedCount,
      allSavedJobs,
      message:
        result.deletedCount > 0
          ? `${result.deletedCount} job(s) deleted successfully`
          : "No matching saved jobs found to delete",
    });
  } catch (err) {
    console.error("🔥 Error while deleting saved jobs:", err);
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
    const allSavedJobs = await SavedJobModel.aggregate([
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
      { $sort: { updatedAt: -1 } },
    ]);
    res.status(200).json({ message: "Job status updated successfully", allSavedJobs });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
}

export const saveJobNotes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { jobId, notes } = req.body;

    const savedJob = await SavedJobModel.findOne({ userId, jobId });
    if (!savedJob) {
      return res.status(404).json({ message: "Saved job not found" });
    }
    savedJob.comment = notes;
    await savedJob.save();
    const allSavedJobs = await SavedJobModel.aggregate([
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
      { $sort: { updatedAt: -1 } },
    ]);
    res.status(200).json({ message: "Notes saved successfully", allSavedJobs });


  } catch (err) {
    console.log("Error in saving notes for job", err);
    res.status(500).json({ message: (err as Error).message });
  }
}