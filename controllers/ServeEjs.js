import { pool } from "../model/db.js";

/////// render landding page
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
    
                res.render("landing.ejs",{imgUrl: req.user.imgurl, data:data.rows, notification});
    
            } catch (err) {
                console.log(err);
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
                console.log(err);
            }
    
}

export async function SettingsPage(req,res){
            res.render("settings.ejs",{imgUrl: req.user.imgurl});

}

/////render set-username page

export async function SetUsername(req,res){
    // problem found
    if (req.user.is_profile_complete) {
        return res.redirect("/home");
    }
    res.render("username.ejs", { imgUrl: req.user.imgurl });
}