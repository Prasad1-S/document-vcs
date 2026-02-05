import express from "express";
import { isAuthenticated } from "../middleware/auth.js";

import { DeleteUserAccess } from "../controllers/accessManager.js";
const router = express.Router();

// Remove User Access
router.post("/:docid", isAuthenticated, DeleteUserAccess);

export default router;
