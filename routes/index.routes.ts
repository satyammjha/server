import express from "express";
import userRoute from "./user.routes";
import jobRoute from "./jobs.routes";
import resumeRoute from "./resume.routes";
import embedRoutes from "./embed.routes";
import otpRoutes from "./otp.routes";

const route = express.Router();

route.get("/health", (req, res) => {
    res.status(200).json({ message: "server is healthy" });
});

route.use("/user", userRoute);
route.use("/jobs", jobRoute);
route.use("/resume", resumeRoute);
route.use("/embed", embedRoutes);
route.use("/otp", otpRoutes);

export default route;