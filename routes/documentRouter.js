import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { pool } from "../db.js";
import { renderNewDocPage } from "../controllers/document.js";
import {showDocumentContent} from "../controllers/document.js"
const router = express.Router();

// refactored
router.get("/edit/:id",async(req,res)=>{
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

// refactored
router.get("/new",renderNewDocPage);

// refactored
router.get("/:docid/v/:id",async(req,res)=>{
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
              v.content,
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
          content: row.content,
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

// refactored
router.get("/view/:id",showDocumentContent);

// refactored
router.post("/new",isAuthenticated, async(req,res)=>{
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

////////Rollback Post endpoint
//////refactored
router.post('/rollback/:docid/:version', isAuthenticated, async (req, res) => {
  const client = await pool.connect();

  try {
    const { docid, version } = req.params;
    const userid = req.user.userid;

    await client.query('BEGIN');

    /* 1️⃣ Permission check (OWNER / EDITOR) */
    const accessCheck = await client.query(
      `
      SELECT role
      FROM access
      WHERE userid = $1 AND docid = $2
      `,
      [userid, docid]
    );

    if (
      accessCheck.rowCount === 0 ||
      !['OWNER', 'EDITOR'].includes(accessCheck.rows[0].role)
    ) {
      throw new Error('Permission denied');
    }

    /* 2️⃣ Fetch document + latest version */
    const docResult = await client.query(
      `
      SELECT latestversion
      FROM documents
      WHERE docid = $1
      `,
      [docid]
    );

    if (docResult.rowCount === 0) {
      throw new Error('Document not found');
    }

    const latestVersionId = docResult.rows[0].latestversion;

    /* 3️⃣ Fetch target version */
    const targetVersion = await client.query(
      `
      SELECT versionid, versioncount, content
      FROM versions
      WHERE docid = $1 AND versioncount = $2
      `,
      [docid, version]
    );

    if (targetVersion.rowCount === 0) {
      throw new Error('Target version does not exist');
    }

    if (targetVersion.rows[0].versionid === latestVersionId) {
      throw new Error('Document is already on this version');
    }

    /* 4️⃣ Get next version number */
    const nextVersionCountResult = await client.query(
      `
      SELECT COALESCE(MAX(versioncount), 0) + 1 AS nextversion
      FROM versions
      WHERE docid = $1
      `,
      [docid]
    );

    const nextVersionCount = nextVersionCountResult.rows[0].nextversion;

    /* 5️⃣ Insert new version (rollback commit) */
    const insertVersion = await client.query(
      `
      INSERT INTO versions (docid, versioncount, content, createdby, commitmsg)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING versionid
      `,
      [
        docid,
        nextVersionCount,
        targetVersion.rows[0].content,
        userid,
        `rolled back document to version v${version}`
      ]
    );

    const newVersionId = insertVersion.rows[0].versionid;

    /* 6️⃣ Update document latestversion */
    await client.query(
      `
      UPDATE documents
      SET latestversion = $1, updatedat = now()
      WHERE docid = $2
      `,
      [newVersionId, docid]
    );

    await client.query('COMMIT');

    console.log(docid, version, 'successful rollback');

    res.json({
      success: true,
      redirectUrl: '/home'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Rollback error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    client.release();
  }
});

// refactored
router.post("/edit",isAuthenticated ,async(req,res)=>{
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

////////////////Access Management
// refactored
router.put("/share/:docid",isAuthenticated,async(req,res)=>{
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
});

//////////DELETE DOCUMENT
// refactored
router .delete("/:docid",isAuthenticated, async(req,res)=>{
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
});


export default router;
