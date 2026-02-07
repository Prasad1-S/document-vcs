import express from "express";
import { SetUsername } from "../controllers/profileController.js";
import { isAuthenticated } from "../middleware/auth.js";
import { ServeSetUsername } from "../controllers/renderController.js";
const router = express.Router();

router.post("/",isAuthenticated , SetUsername);

router.get("/",isAuthenticated , ServeSetUsername);

export default router;

