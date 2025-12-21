import express from "express";
import { addUser, getProfile, signin, updatePreference } from "../controller/user.controller";
import authMiddleware from "../middleware/auth";

const route = express.Router();

route.post("/signup", addUser);
route.post("/signin", signin);
route.get("/profile", authMiddleware, getProfile);
route.post("/updateFilter", authMiddleware, updatePreference);
export default route;