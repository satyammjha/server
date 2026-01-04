import { Request, Response } from "express";
import { SendMailClient } from "zeptomail";
import crypto from "crypto";
import { redis } from "../queue/queue";

const url = "https://api.zeptomail.in/v1.1/email";
const token = process.env.Z_TOKN || '';
const client = new SendMailClient({ url, token });

export const sendOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email required" });

        const otp = crypto.randomInt(100000, 999999).toString();

        await redis.set(`otp:${email}`, otp, 'EX', 300);

        await client.sendMail({
            from: {
                address: "otp@zobly.in",
                name: "Zobly Security",
            },
            to: [
                {
                    email_address: {
                        address: email,
                        name: 'User',
                    },
                },
            ],
            subject: "Your Zobly Verification Code",
            htmlbody: `<p>Your OTP is <b>${otp}</b>. It expires in 5 minutes.</p>`,
        });

        return res.json({ message: "OTP sent successfully" });

    } catch (error: any) {
        const zeptoError = error?.error?.details?.[0]?.message;
        const generalError = error?.error?.message;

        const finalMessage = zeptoError || generalError || "OTP not sent";

        return res.status(500).json({ error: finalMessage });
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

        const storedOtp = await redis.get(`otp:${email}`);

        if (!storedOtp) {
            return res.status(400).json({ error: "OTP expired or not found" });
        }

        if (storedOtp === otp) {
            await redis.del(`otp:${email}`);
            return res.json({ success: true, message: "Verified!" });
        } else {
            return res.status(400).json({ error: "Invalid OTP" });
        }
    } catch (error) {
        console.error("OTP Verify Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};