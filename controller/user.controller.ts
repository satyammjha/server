import type { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcrypt";

const addUser = async (req: Request, res: Response) => {
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

export default addUser;