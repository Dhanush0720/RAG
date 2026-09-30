import ReviewReport from "../models/ReviewReport.js";
import Document from "../models/Document.js";
import DocumentChunk from "../models/DocumentChunk.js";
import { generateReview } from "../services/aiServiceClient.js";

export const createReview = async (req, res, next) => {
  try {
    const { documentId } = req.body;
    const doc = await Document.findOne({ _id: documentId, userId: req.user._id });
    if (!doc) return res.status(404).json({ error: "Document not found." });
    if (doc.status !== "indexed") {
      return res.status(400).json({ error: `Document is not ready yet (status: ${doc.status}).` });
    }

    const chunks = await DocumentChunk.find({ documentId: doc._id })
      .select("chunkIndex content pageNumber metadata -_id")
      .lean();

    const aiResult = await generateReview({ documentId, chunks });

    const review = await ReviewReport.create({
      userId: req.user._id,
      documentId,
      findings: aiResult.findings || [],
      importantClauses: aiResult.importantClauses || [],
      potentialIssues: aiResult.potentialIssues || [],
      sourceReferences: aiResult.sourceReferences || [],
    });

    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.documentId, userId: req.user._id });
    if (!doc) return res.status(404).json({ error: "Document not found." });
    const reviews = await ReviewReport.find({ documentId: doc._id }).sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
};
