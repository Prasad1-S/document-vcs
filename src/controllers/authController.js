import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
const saltRounds=10;

// Register user 
export async function RegisterUser(req,res){
        const { username, password } = req.body;
        try {
            const result = await pool.query(
                "SELECT * FROM users WHERE email=$1",
                [username]
            )
    
            if(result.rowCount>0){
                res.redirect("/?notification=User already exists, try login!");
            }else{
                bcrypt.hash(password,saltRounds, async(err, hash)=>{
                    if(err){
                        console.error('Password hashing error:', err.message);
                        return res.status(500).send('Registration failed');
                    }else{
                        const result = await pool.query(
                            "INSERT INTO users(email, password) VALUES($1,$2) RETURNING *;",
                            [username,hash] 
                        );
    
                        const user = result.rows[0];
                        req.login(user,(err)=>{
                            res.status(303).redirect("/home?notification=Successfully created account.");
                        });
                    }
                })
            }
    
        } catch (err) {
            console.log(`Error Registering User: ${err}`);
        }
    
}

//logout user
export async function LogoutUser(req,res){
        req.logout(function(err){
            if(err){
                return next(err);
            }
            res.redirect("/");
        });
    
}


