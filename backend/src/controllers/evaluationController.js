import EvaluationResult from "../models/EvaluationResult.js";
import { runEvaluation } from "../services/aiServiceClient.js";

// Runs one of the research experiments (A-F, see docs/evaluation.md) against
// the configured benchmark dataset and persists metric rows.
export const triggerEvaluation = async (req, res, next) => {
  try {
    const { experimentName, language, documentId } = req.body;
    if (!experimentName) return res.status(400).json({ error: "experimentName is required." });

    const aiResult = await runEvaluation({ experimentName, language, documentId });

    const rows = (aiResult.metrics || []).map((m) => ({
      documentId: documentId || null,
      language: language || "en",
      metricName: m.name,
      metricValue: m.value,
      evaluationMethod: m.method,
      experimentName,
    }));

    const saved = rows.length ? await EvaluationResult.insertMany(rows) : [];
    res.status(201).json({ results: saved });
  } catch (err) {
    next(err);
  }
};

export const listEvaluationResults = async (req, res, next) => {
  try {
    const { experimentName, language } = req.query;
    const filter = {};
    if (experimentName) filter.experimentName = experimentName;
    if (language) filter.language = language;
    const results = await EvaluationResult.find(filter).sort({ createdAt: -1 }).limit(500);
    res.json({ results });
  } catch (err) {
    next(err);
  }
};

export const getEvaluationResult = async (req, res, next) => {
  try {
    const result = await EvaluationResult.findById(req.params.id);
    if (!result) return res.status(404).json({ error: "Result not found." });
    res.json({ result });
  } catch (err) {
    next(err);
  }
};
