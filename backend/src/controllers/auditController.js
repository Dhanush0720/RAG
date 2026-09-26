import AuditResult from "../models/AuditResult.js";
import Document from "../models/Document.js";
import { runAudit } from "../services/aiServiceClient.js";

export const triggerAudit = async (req, res, next) => {
  try {
    const { documentId, languages, auditType } = req.body;
    const doc = await Document.findOne({ _id: documentId, userId: req.user._id });
    if (!doc) return res.status(404).json({ error: "Document not found." });

    const aiResult = await runAudit({
      documentId,
      languages: languages && languages.length ? languages : ["en", "te", "hi"],
      auditType: auditType || "cross_language_consistency",
    });

    const rows = (aiResult.perLanguage || []).map((r) => ({
      documentId,
      language: r.language,
      auditType: auditType || "cross_language_consistency",
      findings: r.findings || [],
      metricValues: r.metricValues || {},
      limitations: aiResult.limitations || [],
    }));

    const saved = rows.length ? await AuditResult.insertMany(rows) : [];
    res.status(201).json({ results: saved, summary: aiResult.summary || null, limitations: aiResult.limitations || [] });
  } catch (err) {
    next(err);
  }
};

export const listAuditResults = async (req, res, next) => {
  try {
    const { documentId } = req.query;
    const filter = {};
    if (documentId) filter.documentId = documentId;
    const results = await AuditResult.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ results });
  } catch (err) {
    next(err);
  }
};

export const getAuditResult = async (req, res, next) => {
  try {
    const result = await AuditResult.findById(req.params.id);
    if (!result) return res.status(404).json({ error: "Result not found." });
    res.json({ result });
  } catch (err) {
    next(err);
  }
};
