import express from "express";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import { pool } from "./db.js";
import env from "dotenv";
import session from "express-session";


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
app.get("/",(req,res)=>{
    res.render("loginRegister.ejs");
});

app.get("/home",ensureProfileComplete ,async(req,res)=>{
    if(req.isAuthenticated()){
        const Userid = req.user.userid;
        try {
            const data = await pool.query(
                `SELECT d.docid, d.title, d.updatedat, d.ownerid, da.role 
                FROM documents d 
                JOIN access da 
                ON d.docid = da.docid 
                WHERE da.userid = $1;`,
                [Userid]
            );
        
            let notification;
            if (req.query.success === "edit_saved") {
              notification = {
                message: "Edit saved successfully",
                type: "success"
              };
            }

            res.render("landing.ejs",{imgUrl: req.user.imgurl, data:data.rows, notification});

        } catch (err) {
            console.log(err);
        }
    }else{
        res.render("loginRegister.ejs",{data:"Authentication required, Please login first!"});
    }
});

app.get("/edit/:id",async(req,res)=>{
    if(req.isAuthenticated()){
        const docId = req.params.id;
        console.log(docId);
        const userId = req.user.userid;
        try {

            const access = await pool.query(
                "SELECT * FROM access WHERE docid=$1 AND userid=$2",
                [docId, userId]
            );

            console.log(access);

            if(access.rows[0].role=='VIEWER' ||access.rowCount==0){
                console.log("user is not allowed to edit!!");
                return res.status(401).json({message:"You dont have access to this document!!"});
            }else{
                const docs = await pool.query(
                    "SELECT * FROM documents WHERE docid=$1",
                    [docId]
                );
                if(docs.rowCount>0){
                    // querying by putting the default vlue of version number as 1.
                    const docu = await pool.query(
                        "SELECT * FROM versions WHERE versionid=$1",
                        [docs.rows[0].latestversion]
                    );
                    const data ={
                        title:docs.rows[0].title,
                        content:docu.rows[0].content,
                        created_by:docs.rows[0].owner_id,
                        docid:docId
                    };

                    res.render("edit.ejs",{ data,imgUrl: req.user.imgurl});
                }else{
                    res.send(404).json({message: "ther document doesn't exists"});
                }
            }
        } catch (err) {
            console.log(err);
        }
    }else{
        res.render("loginRegister.ejs",{data:"Authentication required, Please login first!"});
    }
});

app.get("/new",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("newdoc.ejs",{imgUrl: req.user.imgurl});
    }else{
        res.render("loginRegister.ejs",{data:"Authentication required, Please login first!"});
    }
});

app.get("/profile",async(req,res)=>{
    if(req.isAuthenticated()){
        const userid= req.user.userid;
        try {
            const created = await pool.query(
                "SELECT COUNT(*) AS total_created FROM access WHERE userid=$1 AND role='OWNER';",
                [userid]
            )

            const shared = await pool.query(
                "SELECT COUNT(*) AS total_shared FROM access WHERE userid=$1 AND role in ('EDITOR','VIEWER');",
                [userid]
            )

            const data = {
                username:req.user.username,
                email:req.user.email,
                created:created.rows[0].total_created,
                shared:shared.rows[0].total_shared
            }

            res.render("profile.ejs",{data,imgUrl: req.user.imgurl});

        } catch (err) {
            console.log(err);
        }
        
    }else{
        res.render("loginRegister.ejs",{data:"Authentication required, Please login first!"});
    }
});

app.get("/settings",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("settings.ejs",{imgUrl: req.user.imgurl});
    }else{
        res.render("loginRegister.ejs",{data:"Authentication required, Please login first!"});
    }
});

app.get("/:docid/v/:id",async(req,res)=>{
    if(req.isAuthenticated()){
        // write the db fetch data
        // send the result back to the user
        const docid = req.params.docid;
        const version = req.params.id;
        const userid = req.user.userid;
        console.log(userid, docid);
        const result = await pool.query(
            "SELECT * from documents WHERE docid=$1",
            [docid]
        );
        if(result.rowCount==0) return res.status(404).json({message:"the requested document does not exist!"});

        const versiondata= await pool.query(
            `SELECT
              v.versionid,
              v.versioncount,
              v.commitmsg,
              v.createdat,
              u.username,
              u.imgurl,
              d.latestversion
            FROM versions v
            JOIN users u
              ON v.createdby = u.userid
            JOIN documents d
              ON v.docid = d.docid 
            WHERE v.docid = $1
            ORDER BY v.versioncount DESC;
            `,
            [docid]
        );

        const versions = versiondata.rows.map(row => ({
          versionCount: row.versioncount,
          summary: row.commitmsg || "No description provided",
          updatedAt: row.createdat,
          isCurrent: row.versionid === row.latestversion,
          editor: {
            name: row.username,
            imgUrl: row.imgurl
          }
        }));

        const currentVersion = versions.find(v => v.isCurrent)?.versionCount || null;

        const versionContentResult = await pool.query(
          `SELECT content, versioncount
           FROM versions
           WHERE docid = $1 AND versioncount = $2`,
          [docid, version]
        );

        if (versionContentResult.rowCount === 0) {
          return res.status(404).json({ message: "Version not found" });
        }
    
        const selectedVersion = versionContentResult.rows[0];
    
        res.render("versions.ejs",{
            title:result.rows[0].title,
            docid:docid,
            versions,
            currentVersion,
            imgUrl:req.user.imgurl,
            currentcontent:selectedVersion.content
        })


    }else{
        res.render("loginRegister.ejs",{data:"Authentication required, Please login first!"});
    }
});

app.get("/view/:id",async(req,res)=>{
    if(req.isAuthenticated()){
        const docId = req.params.id;
        const userId = req.user.userid;

        try {
            const data = await pool.query(
            "SELECT * from access WHERE docid=$1 AND userid=$2",
            [docId, userId]
        );
    
        if(data.rowCount==0){
            return res.status(404).json({message:"You dont have access to this document!!"});
        }else{
            const access = data.rows[0].role;
            console.log(access);
            if(access=='OWNER' || access=='EDITOR' || access=='VIEWER'){

                try {
                    const docsData = await pool.query(
                        "SELECT * FROM documents WHERE docid=$1",
                        [docId]
                    );

                    console.log(docsData.rows[0].latestversion);
                    const versionData = await pool.query(
                        "SELECT * from versions WHERE docid=$1 AND versionid=$2",
                        [docId, docsData.rows[0].latestversion]
                    );

                    console.log(versionData);
                    const ownerData = await pool.query(
                        "SELECT * FROM users WHERE userid=$1",
                        [versionData.rows[0].createdby]
                    );

                    const people = await pool.query(
                        "SELECT a.* , u.username , u.imgurl ,u.email FROM access a Join users u ON a.userid = u.userid WHERE a.docid = $1",
                        [docId]
                    )
                    console.log(people);

                    let owner=false;
                    if(userId==docsData.rows[0].ownerid){
                        owner=true;
                    }

                    res.render("view.ejs",{data:{
                        title:docsData.rows[0].title,
                        latestversion: versionData.rows[0].versioncount,
                        docId:docId,
                        content:versionData.rows[0].content,
                        created_by:ownerData.rows[0].imgurl,
                        people: people.rows,
                        isowner:owner
                    },imgUrl: req.user.imgurl});

                } catch (err) {
                    console.log(err);
                }
            }
        }
    
    
        } catch (err) {
            console.log(err);
        }
    
    }else{
        res.render("loginRegister.ejs",{data:"Authentication required, Please login first!"});
    }
});

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
app.get("/set-username", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }

  if (req.user.is_profile_complete) {
    return res.redirect("/home");
  }

  res.render("username.ejs", { imgUrl: req.user.imgurl });
});

///////////////////////Authentication Function (MIDDLEWARE) /////////////////////////////

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).render("loginRegister.ejs",{data:"User already Created... Please Login!!"});
}

function ensureProfileComplete(req, res, next) {
  if (!req.user.iscomplete) {
    return res.redirect("/set-username");
  }
  next();
}

////////////////////////POST routes for recieving data/////////////////////////

app.post("/new",isAuthenticated, async(req,res)=>{
    const{title, content, commitmsg} = req.body;
    const Userid = req.user.userid;
    const client = await pool.connect();
    try {

        await client.query("BEGIN");

        const docId = await client.query(
            "INSERT INTO documents(title, ownerid) VALUES($1,$2) RETURNING docid;",
            [title,Userid]
        );

        const versionNo = await client.query(
            "INSERT INTO versions(docid, versioncount, content, createdby, commitmsg) VALUES($1,$2,$3,$4,$5) RETURNING versionid;",
            [docId.rows[0].docid, '1', content, Userid, commitmsg]
        );

        await client.query(
            "UPDATE documents SET latestversion=$1 WHERE docid=$2",
            [versionNo.rows[0].versionid, docId.rows[0].docid]
        );

        await client.query(
            "INSERT INTO access(docid, userid, role) VALUES($1, $2, $3);",
            [docId.rows[0].docid, Userid, 'OWNER']
        )
        await client.query("COMMIT");
        // update regarding successfull
        return res.status(303).redirect("/home");
    } catch (err) {
        await client.query("ROLLBACK;");
        console.log(err);
        return res.status(500).json({message:"internal error"});
    }finally{
        client.release();
    }
});

app.post("/edit",isAuthenticated ,async(req,res)=>{
    // does have access to edit? -- 'display access error' ---DONE
    // get document from client  ----------------------------DONE
    // insert to the database and update the latest version in documents table and edit the /home, /view so that it fetches and always shows the latest version-- display 'edit success'
    //  insert into versions 
    //  docid= from req.body
    //  content= from req.body
    //  commitmsg = req.body
    //  createdby= from req.user (every version is can be an independent work of someone)
    // INSERT INTO versions (docid, versioncount, content, commitmsg, createdby)
    // VALUES (
    //   $1,
    //   COALESCE(
    //     (SELECT MAX(versioncount) + 1 FROM versions WHERE docid = $1),
    //     1
    //   ),
    //   $2,
    //   $3,
    //   $4
    // )
    // RETURNING versionid, versioncount;


    const{content, commitmsg, docid}=req.body;
    const userid = req.user.userid;

    try {
        const access = await pool.query(
            "SELECT * FROM access WHERE docid=$1 AND userid=$2;",
            [docid,userid]
        )

        // checking access
        if( access.rowCount==0 || access.rows[0].role=="VIEWER" ){
            // you dont have access to edit this documnet
            return res.status(401).json({message:"you dont have access to edit!"});
        }else{
            // i am not sure what i am doing but this seems right
            const client = await pool.connect();
                    
            try {
              await client.query("BEGIN");
            
              const result = await client.query(
                `
                INSERT INTO versions (docid, versioncount, content, commitmsg, createdby)
                VALUES (
                  $1,
                  COALESCE(
                    (SELECT MAX(versioncount) + 1 FROM versions WHERE docid = $1),
                    1
                  ),
                  $2,
                  $3,
                  $4
                )
                RETURNING versionid, versioncount;
                `,
                [docid, content, commitmsg, userid]
              );

              const versionid = result.rows[0].versionid;

              await client.query(
                "UPDATE documents SET latestversion=$1, updatedat=NOW() WHERE docid=$2;",
                [versionid,docid]
              );
            
              await client.query("COMMIT");
            
            //   handling edit success
            res.redirect("/home?success=edit_saved");
            
            } catch (err) {
              await client.query("ROLLBACK");
            
              if (err.code === "23505") {
                return res.status(409).json({ message: "Conflict, please retry" });
              }
            
              console.error(err);
              res.status(500).json({ message: "Edit failed" });
            
            } finally {
              client.release();
            }
        }
        
    } catch (err) {
        console.log(err);
        res.status(500).json({error:"internal server error!!"});
    }
});


app.delete("/doc/:docid",isAuthenticated, async(req,res)=>{
    const docid = req.params.docid;
    const userid = req.user.userid;
    console.log("delete route got triggered!!");

    try {
        const result = await pool.query(
            "SELECT * FROM access WHERE userid=$1 AND docid=$2;",
            [userid, docid]
        )
        const doc = await pool.query(
            "SELECT * FROM documents WHERE docid=$1;",
            [docid]
        )

        if(doc.rowCount==0) return res.status(404).json({message:"Document Not Found!"});
        if(result.rowCount==0) return res.status(404).json({message:"User Not Found!"});

        const role = result.rows[0].role;
        console.log(role);

        if(role=='OWNER'){
            // perform delete operation
            const operation = await pool.query(
                "DELETE FROM documents WHERE docid=$1;",
                [docid]
            )
            return res.status(200).json({message:"Operaation Successful!!"});
        }else{
            return res.status(401).json({message:"You dont have access to perform this operation!"});
        }
    } catch (err) {
        console.log(err);
    }
    // verify is the user is owner
    // perform delete operations
    
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
                    res.status(303).json({message:"successfully shred document"});
                }
            }else{
                res.status(401).json({message:"sorry you don't have permissions to share!"})
            }
        }else{
            // integrate automatic email sending here!!!
            console.log("implement the email sending logic here!!");
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

app.listen(port,()=>{
    console.log(`Server Running at http://localhost:${port}`);
});