import mongoose from "mongoose";

const findingSchema = new mongoose.Schema(
  {
    title: String,
    category: {
      type: String,
      enum: [
        "Contract Parties",
        "Payment Terms",
        "Obligations",
        "Confidentiality",
        "Termination",
        "Liability",
        "Dispute Resolution",
        "Governing Law",
        "Important Dates",
        "Potentially Ambiguous Clauses",
      ],
    },
    explanation: String,
    sourcePage: Number,
    supportingText: String,
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    uncertain: { type: Boolean, default: false },
  },
  { _id: false }
);

const reviewReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true, index: true },
    findings: { type: [findingSchema], default: [] },
    importantClauses: { type: [String], default: [] },
    potentialIssues: { type: [String], default: [] },
    sourceReferences: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("ReviewReport", reviewReportSchema);
