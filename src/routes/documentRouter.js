import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import * as DocController from "../controllers/document.js"
const router = express.Router();


// refactored
router.get("/new",isAuthenticated , DocController.renderNewDocPage);

// refactored
router.get("/:docid/v/:id",isAuthenticated , DocController.ShowDocumentVersions);

// refactored
router.get("/view/:id",isAuthenticated , DocController.showDocumentContent);

// refactored
router.get("/edit/:id",isAuthenticated , DocController.ShowEditPage);

// refactored
router.post("/new",isAuthenticated, DocController.NewDocumentPost);

//////refactored
router.post('/rollback/:docid/:version', isAuthenticated, DocController.DocumentVersionRollback);

// refactored
router.post("/edit",isAuthenticated , DocController.CreateNewVersion);

// refactored
router.delete("/:docid",isAuthenticated, DocController.DeleteDocument);


export default router;
