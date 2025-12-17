import express from "express";
import userRoute from "./user.routes";
import jobRoute from "./jobs.routes";
import resumeRoute from "./resume.routes";
import embedRoutes from "./embed.routes";

const route = express.Router();

route.get("/health", (req, res) => {
    res.status(200).send("API is healthy");
})
route.use("/user", userRoute);
route.use("/jobs", jobRoute);
route.use("/resume", resumeRoute);
route.use("/embed", embedRoutes);

export default route;