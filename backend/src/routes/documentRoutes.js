import express from "express";
import { upload } from "../middleware/upload.js";
import { protect } from "../middleware/auth.js";
import {
  uploadDocument,
  listDocuments,
  getDocument,
  getDocumentStatus,
  deleteDocument,
  reprocessDocument,
} from "../controllers/documentController.js";

const router = express.Router();

router.use(protect);
router.post("/upload", upload.single("file"), uploadDocument);
router.get("/", listDocuments);
router.get("/:id", getDocument);
router.get("/:id/status", getDocumentStatus);
router.post("/:id/retry", reprocessDocument);
router.delete("/:id", deleteDocument);

export default router;
