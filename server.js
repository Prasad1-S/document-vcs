import express from "express";
// 
import bcrypt from "bcrypt";
//
import passport from "./src/config/passport.js";
// 
import { pool } from "./src/config/db.js";
// 
import env from "dotenv";
// 
import session from "express-session";
import { Resend } from 'resend';
import documentRouter from "./src/routes/documentRouter.js";
import acessManagement from "./src/routes/accessManagement.js"
import { isAuthenticated } from "./src/middleware/auth.js";
import { ensureProfileComplete } from "./src/middleware/profile.js";
import * as Serve from "./src/controllers/ServeEjs.js";
import setUsername from "./src/routes/setUsername.js";





const app = express();
const port = 3000;
const saltRounds=10;
env.config();

// Configure EJS view engine
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(
    session({
        secret:process.env.SESSION_SECRET,
        resave:false,
        saveUninitialized:true,
        cookie:{
            maxAge:1000*60*60*48,
        }
    })
)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());

////////////////GET routes for serving ejs templates///////////////////////

// refactored
app.get("/",(req,res)=>{res.render("loginRegister.ejs");});

// refactored
app.get("/home",ensureProfileComplete,isAuthenticated ,Serve.LandingPage);

// refactored
app.get("/profile",isAuthenticated , Serve.ProfilePage);

// refactored
app.get("/settings",isAuthenticated, Serve.SettingsPage);


app.get(
    "/auth/google",
    passport.authenticate("google",{
        scope:["profile","email"],
    })
);

app.get(
    "/auth/google/home",
    passport.authenticate("google",{
        successRedirect:"/home",
        failureRedirect:"/",
    })
)

app.get("/logout",(req,res)=>{
    req.logout(function(err){
        if(err){
            return next(err);
        }
        res.redirect("/");
    });
});

// versions feature





app.post("/login", passport.authenticate("local",{
    successRedirect:"/home",
    failureRedirect:"/",
}));


app.post("/register",async(req,res)=>{
    const { username, password } = req.body;
    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [username]
        )

        if(result.rowCount>0){
            res.redirect("/",{data:"User already exists, try login!"})
        }else{
            bcrypt.hash(password,saltRounds, async(err, hash)=>{
                if(err){
                    console.log(err);
                }else{
                    const result = await pool.query(
                        "INSERT INTO users(email, password) VALUES($1,$2) RETURNING *;",
                        [username,hash] 
                    );

                    const user = result.rows[0];
                    req.login(user,(err)=>{
                        res.status(303).redirect("/home");
                    });
                }
            })
        }

    } catch (err) {
        console.log(err);
    }
});

// setup the profile









// refactored
app.use("/document", documentRouter);
app.use("/access", acessManagement);
app.use("/set-username", setUsername);


app.listen(port,()=>{
    console.log(`Server Running at http://localhost:${port}`);
});