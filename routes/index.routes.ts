import express from "express";
import userRoute from "./user.routes";
const route = express.Router();

route.use("/user", userRoute);

export default route;