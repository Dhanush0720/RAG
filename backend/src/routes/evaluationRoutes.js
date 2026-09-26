import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  triggerEvaluation,
  listEvaluationResults,
  getEvaluationResult,
} from "../controllers/evaluationController.js";

const router = express.Router();

router.use(protect);
router.post("/run", authorize("admin", "legal_professional"), triggerEvaluation);
router.get("/results", listEvaluationResults);
router.get("/results/:id", getEvaluationResult);

export default router;
