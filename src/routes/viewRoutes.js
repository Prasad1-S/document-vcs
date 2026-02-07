import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { ensureProfileComplete } from "../middleware/profile.js";
import * as Serve from "../controllers/renderController.js";

const router = express.Router();

////public routes
router.get("/",(req,res)=>{
    res.render("loginRegister.ejs");
});

////protected routes
router.get("/home",ensureProfileComplete,isAuthenticated ,Serve.LandingPage);
router.get("/profile",isAuthenticated , Serve.ProfilePage);
router.get("/settings",isAuthenticated, Serve.SettingsPage);

export default router;
