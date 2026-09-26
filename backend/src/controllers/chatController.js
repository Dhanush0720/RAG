import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Document from "../models/Document.js";
import { queryDocument } from "../services/aiServiceClient.js";

export const createConversation = async (req, res, next) => {
  try {
    const { documentId, language } = req.body;
    const doc = await Document.findOne({ _id: documentId, userId: req.user._id });
    if (!doc) return res.status(404).json({ error: "Document not found." });
    if (doc.status !== "indexed") {
      return res.status(400).json({ error: `Document is not ready yet (status: ${doc.status}).` });
    }

    const convo = await Conversation.create({
      userId: req.user._id,
      documentId,
      title: `Chat: ${doc.title}`,
      language: language || "en",
    });
    res.status(201).json({ conversation: convo });
  } catch (err) {
    next(err);
  }
};

export const listConversations = async (req, res, next) => {
  try {
    const convos = await Conversation.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json({ conversations: convos });
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content, language } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Message content is required." });

    const convo = await Conversation.findOne({ _id: conversationId, userId: req.user._id });
    if (!convo) return res.status(404).json({ error: "Conversation not found." });

    const doc = await Document.findOne({ _id: convo.documentId, userId: req.user._id });
    if (!doc) return res.status(404).json({ error: "Underlying document not found." });

    await Message.create({ conversationId, role: "user", content });

    // Retrieve prior turns for light conversational context.
    const history = await Message.find({ conversationId }).sort({ createdAt: 1 }).limit(20);

    const aiResult = await queryDocument({
      documentId: doc._id.toString(),
      question: content,
      language: language || convo.language || "en",
      history: history.map((m) => ({ role: m.role, content: m.content })),
    });

    const assistantMsg = await Message.create({
      conversationId,
      role: "assistant",
      content: aiResult.answer,
      citations: aiResult.citations || [],
      confidence: aiResult.confidence || "medium",
    });

    convo.updatedAt = new Date();
    await convo.save();

    res.json({ message: assistantMsg });
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const convo = await Conversation.findOne({ _id: req.params.id, userId: req.user._id });
    if (!convo) return res.status(404).json({ error: "Conversation not found." });
    const messages = await Message.find({ conversationId: convo._id }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const convo = await Conversation.findOne({ _id: req.params.id, userId: req.user._id });
    if (!convo) return res.status(404).json({ error: "Conversation not found." });
    await Message.deleteMany({ conversationId: convo._id });
    await convo.deleteOne();
    res.json({ message: "Conversation deleted." });
  } catch (err) {
    next(err);
  }
};
