import { pool } from "../model/db.js";

export async function SetUsername(req,res){
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
}