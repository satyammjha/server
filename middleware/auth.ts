import type { Request, Response, NextFunction } from "express";
import Jwt, { type JwtPayload } from "jsonwebtoken";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = Jwt.verify(token, secret!) as JwtPayload & { id?: string };

    if (!decoded.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    (req as any).userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;