import type { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userPreferencesModel from "../models/userPreferences.model";
import { userEmbeddingQueue } from "../queue/queue";
import { mergeSkills } from "../utils/mergeSkills.utis";

export const addUser = async (req: Request, res: Response) => {
  console.log("Request received:", req.body);
  try {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({
      message: "User created successfully",
      user: newUser.toObject(),
    });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    const isPasswordTrue = await bcrypt.compare(
      String(password),
      String((user as any).password)
    );
    if (!isPasswordTrue) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: user?._id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );
    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
};

export const updatePreference = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    console.log("[updatePreference] userId:", userId);

    const {
      skills_manual,
      preferred_roles,
      location,
      expected_salary_min,
      expected_salary_max,
      experience_years,
      open_to_remote,
    } = req.body;

    console.log("[updatePreference] request body:", {
      skills_manual,
      preferred_roles,
      location,
      expected_salary_min,
      expected_salary_max,
      experience_years,
      open_to_remote,
    });

    const user = await User.findById(userId).lean();
    console.log("[updatePreference] user found:", !!user);

    if (!user) {
      console.log("[updatePreference] user not found, exiting");
      return res.status(404).json({ message: "User not found" });
    }

    const existingPrefs = await userPreferencesModel.findOne({ userId }).lean();
    console.log("[updatePreference] existingPrefs:", existingPrefs);

    const skillsFromResume = existingPrefs?.skills_from_resume || [];
    console.log("[updatePreference] skillsFromResume:", skillsFromResume);

    const mergedSkills = mergeSkills(
      skills_manual || existingPrefs?.skills_manual || [],
      skillsFromResume
    );
    console.log("[updatePreference] mergedSkills:", mergedSkills);

    const updateResult = await userPreferencesModel.updateOne(
      { userId },
      {
        $set: {
          skills_manual: skills_manual ?? existingPrefs?.skills_manual ?? [],
          merged_skills: mergedSkills,
          preferred_roles,
          location,
          expected_salary_min,
          expected_salary_max,
          experience_years,
          open_to_remote,

          embedding_queued: true,
          is_embedded: false,
        },
      },
      { upsert: true }
    );

    console.log("[updatePreference] preferences update result:", updateResult);

    const queueResult = await userEmbeddingQueue.add(
      "user-embedding",
      { userId },
      {
        attempts: 3,
        backoff: { type: "fixed", delay: 5000 },
      }
    );

    console.log("[updatePreference] embedding job queued:", {
      jobId: queueResult.id,
    });

    return res.status(200).json({
      message: "Preferences updated successfully. Embedding queued.",
    });
  } catch (error) {
    console.error("[updatePreference] error:", error);
    return res.status(500).json({
      message: "Failed to update preferences",
    });
  }
};