import { pool } from "../config/db.js";

//////////////DELETE USER ACCESS
export async function DeleteUserAccess(req,res) {
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

}

///////////ADD ACCESS
export async function GrantAccess(req,res){
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

}

/////////Update Access
export async function UpdateAccess(req,res) {
    const docid = req.params.docid;
        const userid = req.user.userid;//check if this is the owner of the document if not then reject req
        console.log(docid);
        try {
            const owner = await pool.query(
                "SELECT * FROM documents WHERE docid=$1;",
                [docid]
            )
            if (owner.rowCount==0) return res.status(404).json({message:"The Document Doesn't exist"});
            if (owner.rows[0].ownerid!= userid) return res.status(401).json({message:"Unauthorized Access!"});
    
            const {role, personemail} = req.body;
            const newRole = role;
            console.log(personemail, newRole);
            const person = await pool.query(
                "SELECT * FROM users WHERE email=$1",
                [personemail]
            )
            console.log("success1")
            if(person.rowCount==0) return res.status(404).json({message:"The user doesn't exist!"});
            console.log("success2")
            const personid = person.rows[0].userid;        
            const update = await pool.query(
                "UPDATE access SET role=$1 WHERE userid=$2 AND docid=$3;",
                [newRole,personid,docid]
            )
            console.log("success3")
            return res.status(200).json({message:"Successfully Updated Access!"});
        } catch (err) {
            console.log(err);
        }
}