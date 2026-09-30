import Document from "../models/Document.js";
import DocumentChunk from "../models/DocumentChunk.js";
import path from "path";
import fs from "fs";
import { ingestDocument } from "../services/aiServiceClient.js";

const EXT_TO_TYPE = { ".pdf": "pdf", ".docx": "docx", ".txt": "txt" };

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });

    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileType = EXT_TO_TYPE[ext];
    if (!fileType) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: "Unsupported file extension." });
    }

    const doc = await Document.create({
      userId: req.user._id,
      title: req.body.title || req.file.originalname,
      originalFileName: req.file.originalname,
      fileType,
      filePath: req.file.path,
      selectedLanguage: req.body.language || "auto",
      status: "uploaded",
    });

    // Kick off async processing with base64 data and absolute path
    processDocumentAsync(
      doc._id.toString(),
      path.resolve(doc.filePath),
      doc.fileType,
      doc.selectedLanguage,
      doc.originalFileName
    );

    res.status(201).json({ document: doc });
  } catch (err) {
    next(err);
  }
};

export async function processDocumentAsync(documentId, filePath, fileType, language, originalFileName) {
  try {
    await Document.findByIdAndUpdate(documentId, { status: "processing", processingError: null });

    let fileBase64 = null;
    try {
      if (fs.existsSync(filePath)) {
        fileBase64 = fs.readFileSync(filePath).toString("base64");
      }
    } catch (e) {
      console.warn("Could not read file for base64 transfer:", e.message);
    }

    const result = await ingestDocument({
      documentId,
      filePath,
      fileBase64,
      fileName: originalFileName || path.basename(filePath),
      fileType,
      language,
    });

    // Persist chunk metadata returned by the AI service (text lives in Mongo,
    // vectors live in the AI service's FAISS index, linked by documentId+chunkIndex).
    if (Array.isArray(result.chunks) && result.chunks.length) {
      await DocumentChunk.deleteMany({ documentId });
      const docs = result.chunks.map((c) => ({
        documentId,
        chunkIndex: c.chunkIndex,
        content: c.content,
        pageNumber: c.pageNumber ?? null,
        metadata: c.metadata || {},
      }));
      await DocumentChunk.insertMany(docs);
    }

    await Document.findByIdAndUpdate(documentId, {
      status: "indexed",
      detectedLanguage: result.detectedLanguage || null,
      pageCount: result.pageCount || 0,
      processingError: null,
    });
  } catch (err) {
    console.error(`Ingestion failed for document ${documentId}:`, err.message);
    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
      processingError: err.message,
    });
  }
}

export const reprocessDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user._id });
    if (!doc) return res.status(404).json({ error: "Document not found." });

    processDocumentAsync(
      doc._id.toString(),
      path.resolve(doc.filePath),
      doc.fileType,
      doc.selectedLanguage,
      doc.originalFileName
    );

    res.json({ message: "Reprocessing started.", status: "processing" });
  } catch (err) {
    next(err);
  }
};

export const listDocuments = async (req, res, next) => {
  try {
    const docs = await Document.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ documents: docs });
  } catch (err) {
    next(err);
  }
};

export const getDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user._id });
    if (!doc) return res.status(404).json({ error: "Document not found." });
    res.json({ document: doc });
  } catch (err) {
    next(err);
  }
};

export const getDocumentStatus = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user._id }).select(
      "status processingError pageCount detectedLanguage"
    );
    if (!doc) return res.status(404).json({ error: "Document not found." });
    res.json({ status: doc.status, processingError: doc.processingError, pageCount: doc.pageCount, detectedLanguage: doc.detectedLanguage });
  } catch (err) {
    next(err);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user._id });
    if (!doc) return res.status(404).json({ error: "Document not found." });

    await DocumentChunk.deleteMany({ documentId: doc._id });
    fs.unlink(doc.filePath, () => {});
    await doc.deleteOne();

    res.json({ message: "Document deleted." });
  } catch (err) {
    next(err);
  }
};
