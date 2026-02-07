import express from "express";
import { isAuthenticated } from "../middleware/auth.js";

import * as Access from "../controllers/accessController.js";
const router = express.Router();

// Remove User Access
router.post("/:docid", isAuthenticated, Access.DeleteUserAccess);
// add access
router.post("/",isAuthenticated , Access.GrantAccess);
// Update Access
router.put("/edit/:docid",isAuthenticated, Access.UpdateAccess);


export default router;
