import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { pool } from "../db.js";
import { CreateNewVersion, DeleteDocument, DocumentVersionRollback, NewDocumentPost, renderNewDocPage } from "../controllers/document.js";
import {showDocumentContent} from "../controllers/document.js";
import { ShowDocumentVersions } from "../controllers/document.js";
import { ShareDocument } from "../controllers/document.js";
import { ShowEditPage } from "../controllers/document.js";
const router = express.Router();


// refactored
router.get("/new",renderNewDocPage);

// refactored
router.get("/:docid/v/:id",ShowDocumentVersions);

// refactored
router.get("/view/:id",showDocumentContent);

// refactored
router.get("/edit/:id",ShowEditPage);

// refactored
router.post("/new",isAuthenticated, NewDocumentPost);

//////refactored
router.post('/rollback/:docid/:version', isAuthenticated, DocumentVersionRollback);

// refactored
router.post("/edit",isAuthenticated ,CreateNewVersion);

// refactored
router.put("/share/:docid",isAuthenticated,ShareDocument);

// refactored
router.delete("/:docid",isAuthenticated, DeleteDocument);


export default router;
