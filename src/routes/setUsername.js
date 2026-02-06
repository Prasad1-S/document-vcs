import express from "express";
import { SetUsername } from "../controllers/setUsername.js";
import { isAuthenticated } from "../middleware/auth.js";
import { ServeSetUsername } from "../controllers/ServeEjs.js";
const router = express.Router();

router.post("/",isAuthenticated , SetUsername);

router.get("/",isAuthenticated , ServeSetUsername);

export default router;

