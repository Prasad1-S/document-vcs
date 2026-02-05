import express from "express";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import { pool } from "./model/db.js";
import env from "dotenv";
import session from "express-session";
import { Resend } from 'resend';
import documentRouter from "./routes/documentRouter.js";
import { isAuthenticated } from "./middleware/auth.js";
import { ensureProfileComplete } from "./middleware/profile.js";
import * as Serve from "./controllers/ServeEjs.js"





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


// username setupt
app.get("/set-username",isAuthenticated ,Serve.SetUsername);

///////////////////////Authentication Function (MIDDLEWARE) /////////////////////////////



////////////////////////POST routes for recieving data/////////////////////////

 

app.post("/access/:docid", isAuthenticated, async (req, res) => {

  const docid = req.params.docid;
  const { personemail } = req.body;
  const ownerId = req.user.userid;

  console.log(docid, personemail, ownerId);
//   verify the owner is the owner or not
// verify does the document and personemail exist or not
    try {

        const docCheck = await pool.query(
            "SELECT  * FROM documents WHERE docid=$1;",
            [docid]
        )

        if(docCheck.rowCount==0) return res.status(404).json({message:"Document Doesn't Exist!"});

        const personCheck = await pool.query(
            "SELECT * FROM users WHERE email=$1;",
            [personemail]
        )
        if(personCheck.rowCount==0) return res.status(404).json({message:"User doesn't exist!"});

        const personid = personCheck.rows[0].userid;
        if(ownerId==personid) return res.status(400).json({message:"Owner Cannot Remove Themselves!"});

        const owner = await pool.query(
            "SELECT * FROM access WHERE userid=$1 AND docid=$2 AND role='OWNER';",
            [ownerId, docid]
        )
        if(owner.rowCount==0) return res.status(403).json({ message:"Unauthorized Access!"});

        // yes the document exists
        // yes the person the user wants to delete exists
        // yes the user who requests this delete request exists and is a true owner of this document
        // should i do the db query to delete?

        const result = await pool.query(
            "DELETE FROM access WHERE docid=$1 AND userid=$2;",
            [docid,personid]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({
              message: "Access already removed or never existed"
            });
        }

        return res.status(200).json({ success: true });
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({message:"Internal Server Error!"});
    }
});


app.post("/share",isAuthenticated , async(req,res)=>{
    const{user, access, docId} = req.body;
    // i have to identify first whether the user is email or userid
    

    try {
        const result= await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [user]
        )
        // if sharing user exists
        if(result.rowCount>0){
            const SharingUserID = result.rows[0].userid;
            const sharerUserId = req.user.userid;
            console.log(req.body);

            const isAccess = await pool.query(
                "SELECT * FROM access WHERE docid=$1 AND userid=$2 ;",
                [docId, sharerUserId]
            )

            console.log(isAccess);
            if(isAccess.rows[0].role=='OWNER'){
                const data = await pool.query(
                  `
                  INSERT INTO access (docid, userid, role)
                  VALUES ($1, $2, $3)
                  ON CONFLICT (docid, userid) DO NOTHING
                  RETURNING *;
                  `,
                  [docId, SharingUserID, access]
                );

                if (data.rowCount === 0) {
                    // send notification about this
                    console.log("User already has access");
                }else{
                    console.log("document shared!")
                    return res.status(303).json({message:"successfully shred document"});
                }
            }else{
                console.log("no permission to share!");
                return res.status(401).json({message:"sorry you don't have permissions to share!"})
            }
        }else{

            try {
                // integrate automatic email sending here!!!
                const resend = new Resend(process.env.EMAIL_API_KEY);
                // const user = verify if it is email;
                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user);

                if (!isEmail) {
                  return res.status(400).json({ message: "Invalid email address" });
                }

                console.log(user);
                await resend.emails.send({
                  from: 'Acme <onboarding@resend.dev>',
                  to: [user],
                  subject: 'hello world',
                  html: '<p>it works!</p>',
                });

                console.log("implement the email sending logic here!!");
                return res.status(200).json({message:"successfully shred document"});
            } catch (err) {
                console.log(err);
                return res.status(500).json({message:"Internal server error!"});
            }
        }
    } catch (err) {
     console.log(err);   
    }
});

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
app.post("/set-username", async (req, res) => {
  const { username } = req.body;
  const userId = req.user.userid;
  console.log(req.user);
  console.log(username, userId);

  try {
    await pool.query(
      `UPDATE users 
       SET username=$1, iscomplete=true 
       WHERE userid=$2`,
      [username, userId]
    );

    res.redirect("/home");
  } catch (err) {
    console.log(err);
    res.render("username.ejs", { error: "Username already taken" });
  }
});


passport.use("local", new Strategy(async function verify(username, password, cb){
    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [username]
        );
        if(result.rowCount>0){
            const user = result.rows[0];
            const storedPassword = user.password;
            bcrypt.compare(password,storedPassword, (err,valid)=>{
                if(err){
                    console.log(err);
                    return cb(err);
                }else{
                    if(valid){
                        return cb(null,user);
                    }else{
                        return cb(null,false);
                    }
                }
            })
        }else{
            return cb(null, false);
        }
    } catch (err) {
        console.log(err);
    }
}));

passport.use(
    "google",
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/home",
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
        },
        async(accessToken, refreshToken, profile , cb)=>{
            try {
                const result = await pool.query("SELECT * FROM users WHERE email=$1",[
                    profile.email,
                ]);
                console.log(profile);
                if(result.rows.length===0){
                    const newUser = await pool.query(
                        "INSERT INTO users(email, password, imgurl) VALUES($1,$2,$3)",
                        [profile.email,"google", profile.photos?.[0]?.value]
                    );
                    return cb(null, newUser.rows[0]);
                }else{
                    return cb(null, result.rows[0]);
                }
            } catch (err) {
                return cb(err);
            }
        }
    )
)

passport.serializeUser((user, cb)=>{
    cb(null, user.userid);
})

passport.deserializeUser(async (id,cb)=>{
    const result = await pool.query(
    "SELECT * FROM users WHERE userid=$1",
    [id]
  );
  cb(null, result.rows[0]);
})

app.use("/document", documentRouter);

app.listen(port,()=>{
    console.log(`Server Running at http://localhost:${port}`);
});