import passport from "passport";
import bcrypt from "bcrypt";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import { pool } from "./db.js";

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
                    console.error('Password comparison error:', err.message);
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
        console.error('Login error:', err.message);
        res.status(500).send('An error occurred');
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

export default passport;