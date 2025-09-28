import express from "express";
import addUser from "../controller/user.controller";

const route = express.Router();

route.post("/signup", addUser);
export default route;