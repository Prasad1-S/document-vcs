import express from "express";
import passport from "../config/passport.js";
import * as Auth from "../controllers/auth.js"

const router = express.Router();

////login
router.post("/login", passport.authenticate("local",{
    successRedirect:"/home",
    failureRedirect:"/",
}));

///// register
router.post("/register",Auth.RegisterUser);

/////logout
router.get("/logout",Auth.LogoutUser);

//////google oauth
router.get(
    "/auth/google",
    passport.authenticate("google",{
        scope:["profile","email"],
    })
);

// google oauth redirect
router.get(
    "/auth/google/home",
    passport.authenticate("google",{
        successRedirect:"/home",
        failureRedirect:"/",
    })
)

export default router;