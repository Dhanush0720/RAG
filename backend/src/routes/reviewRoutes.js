import express from "express";
import { protect } from "../middleware/auth.js";
import { createReview, getReviews } from "../controllers/reviewController.js";

const router = express.Router();

router.use(protect);
router.post("/generate", createReview);
router.get("/:documentId", getReviews);

export default router;
