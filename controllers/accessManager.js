import { pool } from "../model/db.js";

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