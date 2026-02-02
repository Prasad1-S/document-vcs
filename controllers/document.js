import { pool } from "../db.js";

export function renderNewDocPage(req,res){
    if(req.isAuthenticated()){
        res.render("newdoc.ejs",{imgUrl: req.user.imgurl});
    }else{
        res.render("loginRegister.ejs",{data:"Authentication required, Please login first!"});
    }
}

export async function showDocumentContent(req,res){
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
                        [docsData.rows[0].ownerid]
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
                        owner:ownerData.rows[0].username,
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
}