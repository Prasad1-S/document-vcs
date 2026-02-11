import { pool } from "../config/db.js";

//////////////DELETE USER ACCESS
export async function DeleteUserAccess(req,res) {
      const docid = req.params.docid;
  const { personemail } = req.body;
  const ownerId = req.user.userid;

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
        console.log(`Could not remove user access: ${err}`);
        return res.status(500).json({message:"Internal Server Error!"});
    }

}

///////////ADD ACCESS
export async function GrantAccess(req,res){
        const{user, access, docId} = req.body;
    

    try {
        const result= await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [user]
        )
        // if sharing user exists
        if(result.rowCount>0){
            const SharingUserID = result.rows[0].userid;
            const sharerUserId = req.user.userid;

            const isAccess = await pool.query(
                "SELECT * FROM access WHERE docid=$1 AND userid=$2 ;",
                [docId, sharerUserId]
            )

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
                    console.log("User already has access");
                    return res.status(200).json({message:"User already has access!"});
                }else{
                    console.log("document shared!")
                return res.json({
                  success: true,
                  redirectUrl: `/document/view/${docId}?notification=Document Shared Successfully!`
                });
                }
            }else{
                console.log("no permission to share!");
                return res.status(401).json({message:"sorry you don't have permissions to share!"})
            }
        }else{

            try {
                const resend = new Resend(process.env.EMAIL_API_KEY);
                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user);

                if (!isEmail) {
                  return res.status(400).json({ message: "Invalid email address" });
                }

                await resend.emails.send({
                  from: 'Acme <onboarding@resend.dev>',
                  to: [user],
                  subject: 'hello world',
                  html: '<p>it works!</p>',
                });

                console.log("The email should go the the desired user (integration required)");
                 return res.json({
                  success: true,
                  redirectUrl: `/document/view/${docId}?notification=Document Shared Successfully!`
                });

            } catch (err) {
                console.log(`Error occured while shring the email to new user (not in the DB): ${err}`);
                return res.json({
                  success: true,
                  redirectUrl: `/document/view/${docId}?notification=Document Shared Successfully!`
                });
                
            }
        }
    } catch (err) {
     console.log(`Access Share Error: ${err}`);
     return res.status(500).json({message:"Internal server error!"});   
    }

}

/////////Update Access
export async function UpdateAccess(req,res) {
    const docid = req.params.docid;
        const userid = req.user.userid;//check if this is the owner of the document if not then reject req
        try {
            const owner = await pool.query(
                "SELECT * FROM documents WHERE docid=$1;",
                [docid]
            )
            if (owner.rowCount==0) return res.status(404).json({message:"The Document Doesn't exist"});
            if (owner.rows[0].ownerid!= userid) return res.status(401).json({message:"Unauthorized Access!"});
    
            const {role, personemail} = req.body;
            const newRole = role;
            const person = await pool.query(
                "SELECT * FROM users WHERE email=$1",
                [personemail]
            )
            if(person.rowCount==0) return res.status(404).json({message:"The user doesn't exist!"});
            const personid = person.rows[0].userid;        
            const update = await pool.query(
                "UPDATE access SET role=$1 WHERE userid=$2 AND docid=$3;",
                [newRole,personid,docid]
            )
            return res.status(200).json({message:"Successfully Updated Access!"});
        } catch (err) {
            console.log(`Error While updating the Access: ${err}`);
            return res.status(500).json({message:"Internal server error!"});
        }
}