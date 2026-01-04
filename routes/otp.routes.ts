import { sendOtp, verifyOtp } from "../controller/otp.controller";
import express from 'express'

const router = express.Router();

router.post('/send', sendOtp);
router.post('/verify', verifyOtp);

export default router;