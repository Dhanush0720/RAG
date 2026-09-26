import mongoose from "mongoose";

const auditResultSchema = new mongoose.Schema(
  {
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true, index: true },
    language: { type: String, required: true },
    auditType: { type: String, required: true },
    findings: { type: [String], default: [] },
    metricValues: { type: mongoose.Schema.Types.Mixed, default: {} },
    limitations: { type: [String], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model("AuditResult", auditResultSchema);
