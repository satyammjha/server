import express from "express";
import { addUser, getPreference, getProfile, signin, updatePreference } from "../controller/user.controller";
import authMiddleware from "../middleware/auth";
import { authWithGoogle } from "../controller/googleauth.controller";

const route = express.Router();

route.post("/signup", addUser);
route.post("/signin", signin);
route.get("/profile", authMiddleware, getProfile);
route.post("/updateFilter", authMiddleware, updatePreference);
route.get("/preference", authMiddleware, getPreference);
route.post("/auth", authWithGoogle);
export default route;