import mongoose from "mongoose";

const summarySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true, index: true },
    summaryType: {
      type: String,
      enum: [
        "executive",
        "detailed",
        "simple_language",
        "key_clauses",
        "obligations",
        "risk_review",
        "multilingual",
      ],
      required: true,
    },
    language: { type: String, enum: ["en", "te", "hi"], default: "en" },
    content: { type: String, required: true },
    sourceReferences: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Summary", summarySchema);
