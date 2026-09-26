import express from "express";
import { protect } from "../middleware/auth.js";
import { triggerAudit, listAuditResults, getAuditResult } from "../controllers/auditController.js";

const router = express.Router();

router.use(protect);
router.post("/run", triggerAudit);
router.get("/results", listAuditResults);
router.get("/:id", getAuditResult);

export default router;
