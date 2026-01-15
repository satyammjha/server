import axios from "axios";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import User from "../models/user.model.js";

interface DecodedToken {
    email?: string;
    name?: string;
    picture?: string;
    sub?: string;
}

export const authWithGoogle = async (req: Request, res: Response) => {
    try {
        const { code } = req.body;

        if (!code) {
            console.error("❌ Code missing in request body");
            return res.status(400).json({ message: "Code missing" });
        }

        const tokenRes = await axios.post(
            `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
            {
                grant_type: "authorization_code",
                client_id: process.env.AUTH0_CLIENT_ID,
                client_secret: process.env.AUTH0_CLIENT_SECRET,
                code,
                redirect_uri: process.env.AUTH0_REDIRECT_URI,
            },
            { headers: { "Content-Type": "application/json" } }
        );

        const { id_token } = tokenRes.data;
        const decoded = jwt.decode(id_token) as DecodedToken;

        if (!decoded || !decoded.email || !decoded.sub) {
            console.error("❌ Invalid decoded token", decoded);
            return res.status(400).json({ message: "Invalid Google token" });
        }

        let user = await User.findOne({ email: decoded.email });

        if (!user) {
            let baseUsername = decoded.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
            let username = baseUsername;
            let count = 1;

            while (await User.exists({ username })) {
                username = `${baseUsername}${count}`;
                count++;
            }

            user = await User.create({
                email: decoded.email,
                username,
                name: decoded.name || "User",
                avatar: decoded.picture,
                provider: "google",
                providerId: decoded.sub,
            });
        } else {
            console.log("✅ Existing user found:", user._id.toString());
        }

        const appToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
        );

        return res.json({ token: appToken, user });
    } catch (err: any) {
        console.error("🔥 Google OAuth FAILED");
        console.error("➡️ Error message:", err.message);
        console.error("➡️ Auth0 response:", err.response?.data);
        console.error("➡️ Status:", err.response?.status);

        return res.status(401).json({ message: "Google auth failed" });
    }
};