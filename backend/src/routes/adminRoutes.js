import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { listUsers, getStatistics } from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/users", listUsers);
router.get("/statistics", getStatistics);

export default router;
