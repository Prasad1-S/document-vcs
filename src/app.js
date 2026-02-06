import express from "express";
import session from "express-session";
import env from "dotenv";
import passport from "./config/passport.js";

//routes
import authRoutes from "./routes/authRoutes.js";
import viewRoutes from "./routes/viewRoutes.js";
import documentRouter from "./routes/documentRoutes.js";
import accessManagement from "./routes/accessRoutes.js";
import setUsername from "./routes/profileRoutes.js";

env.config();
const app = express();

// Configure EJS view engine
app.set("view engine", "ejs");
app.set("views", "./views");

/////session management
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

//////routes
app.use("/",viewRoutes);
app.use("/", authRoutes);
app.use("/document", documentRouter);
app.use("/access", accessManagement);
app.use("/set-username", setUsername);

export default app;