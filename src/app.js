import express from "express";
import session from "express-session";
import env from "dotenv";
import passport from "./config/passport.js";

env.config();
const app = express();

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