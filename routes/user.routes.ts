import express from "express";
import { addUser, getProfile, signin } from "../controller/user.controller";
import authMiddleware from "../middleware/auth";

const route = express.Router();

route.post("/signup", addUser);
route.post("/signin", signin);
route.get("/profile",  authMiddleware, getProfile);
export default route;