import { pool } from "../config/db.js";

/////// render landing page
export async function LandingPage(req,res){
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
    
                res.render("landing.ejs",{imgUrl: req.user.imgurl, data:data.rows});
    
            } catch (err) {
                console.log(`Error rendering the landing page: ${err}`);
                return res.status(500).json({error:"Internal Server Error!"});
            }
    
}

/////render profile setup page
export async function ProfilePage(req,res) {
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
                console.log(`Error rendering the profile page: ${err}`);
                return res.status(500).json({error:"Internal Server Error!"});
            }
    
}

export async function SettingsPage(req,res){
    try{
    res.render("settings.ejs",{imgUrl: req.user.imgurl});
    }catch(err){
        console.log(`Error rendering the Settings page: ${err}`);
        return res.status(500).json({error:"Internal Server Error!"});
    }
}

/////render set-username page

export async function ServeSetUsername(req,res){
    // problem found (solved)
const { rows } = await pool.query(
        "SELECT iscomplete, imgurl FROM users WHERE userid = $1",
        [req.user.userid]
    );

    if (rows[0].iscomplete) {
        return res.redirect("/home");
    }

    res.render("username", { imgUrl: rows[0].imgurl });
}