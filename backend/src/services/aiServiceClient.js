import axios from "axios";

// Thin wrapper around the Python FastAPI AI service. All calls carry an
// internal shared-secret header so the AI service only accepts requests
// coming from this backend, never directly from a browser.
const aiClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL || "http://localhost:8000",
  timeout: parseInt(process.env.AI_SERVICE_TIMEOUT_MS, 10) || 300000,
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
});

aiClient.interceptors.request.use((config) => {
  config.headers["X-Internal-Token"] = process.env.AI_SERVICE_TOKEN || "lexirag_internal";
  return config;
});


const wrap = async (fn) => {
  try {
    return await fn();
  } catch (err) {
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      const e = new Error(
        "AI service is unreachable. Ensure the Python ai-service is running and AI_SERVICE_URL is correct."
      );
      e.statusCode = 503;
      throw e;
    }
    const detail = err.response?.data?.detail || err.response?.data?.error || err.message;
    const e = new Error(`AI service error: ${detail}`);
    e.statusCode = err.response?.status || 502;
    throw e;
  }
};

export const ingestDocument = (payload) => wrap(() => aiClient.post("/rag/ingest", payload).then((r) => r.data));

export const queryDocument = (payload) => wrap(() => aiClient.post("/rag/query", payload).then((r) => r.data));

export const generateSummary = (payload) =>
  wrap(() => aiClient.post("/summary/generate", payload).then((r) => r.data));

export const generateReview = (payload) =>
  wrap(() => aiClient.post("/review/generate", payload).then((r) => r.data));

export const runEvaluation = (payload) =>
  wrap(() => aiClient.post("/evaluation/run", payload).then((r) => r.data));

export const runAudit = (payload) => wrap(() => aiClient.post("/evaluation/audit", payload).then((r) => r.data));

export default aiClient;
