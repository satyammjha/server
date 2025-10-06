import express from "express";
import userRoute from "./user.routes";
import jobRoute from "./saveJob.routes";
import resumeRoute from "./resume.routes";
const route = express.Router();

route.use("/user", userRoute);
route.use("/jobs", jobRoute);
route.use("/resume", resumeRoute);

export default route;