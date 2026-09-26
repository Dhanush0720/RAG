import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createConversation,
  listConversations,
  sendMessage,
  getMessages,
  deleteConversation,
} from "../controllers/chatController.js";

const router = express.Router();

router.use(protect);
router.post("/conversations", createConversation);
router.get("/conversations", listConversations);
router.get("/conversations/:id/messages", getMessages);
router.post("/message", sendMessage);
router.delete("/conversations/:id", deleteConversation);

export default router;
