import express from "express";
import userRoute from "./user.routes";
import jobRoute from "./saveJob.routes";
const route = express.Router();

route.use("/user", userRoute);
route.use('/jobs', jobRoute);

export default route;