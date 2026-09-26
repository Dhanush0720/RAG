import express from "express";
import { protect } from "../middleware/auth.js";
import { createSummary, listSummaries } from "../controllers/summaryController.js";

const router = express.Router();

router.use(protect);
router.post("/generate", createSummary);
router.get("/:documentId", listSummaries);

export default router;
