import express from "express";
import { addUser, signin} from "../controller/user.controller";

const route = express.Router();

route.post("/signup", addUser);
route.post("/signin", signin);
export default route;