import Summary from "../models/Summary.js";
import Document from "../models/Document.js";
import { generateSummary } from "../services/aiServiceClient.js";

export const createSummary = async (req, res, next) => {
  try {
    const { documentId, summaryType, language, length } = req.body;
    const doc = await Document.findOne({ _id: documentId, userId: req.user._id });
    if (!doc) return res.status(404).json({ error: "Document not found." });
    if (doc.status !== "indexed") {
      return res.status(400).json({ error: `Document is not ready yet (status: ${doc.status}).` });
    }

    const aiResult = await generateSummary({
      documentId,
      summaryType: summaryType || "executive",
      language: language || "en",
      length: length || "medium",
    });

    const summary = await Summary.create({
      userId: req.user._id,
      documentId,
      summaryType: summaryType || "executive",
      language: language || "en",
      content: aiResult.content,
      sourceReferences: aiResult.sourceReferences || [],
    });

    res.status(201).json({ summary });
  } catch (err) {
    next(err);
  }
};

export const listSummaries = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.documentId, userId: req.user._id });
    if (!doc) return res.status(404).json({ error: "Document not found." });
    const summaries = await Summary.find({ documentId: doc._id }).sort({ createdAt: -1 });
    res.json({ summaries });
  } catch (err) {
    next(err);
  }
};
