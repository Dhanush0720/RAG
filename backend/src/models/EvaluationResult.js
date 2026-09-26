import mongoose from "mongoose";

const evaluationResultSchema = new mongoose.Schema(
  {
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", default: null },
    language: { type: String, required: true },
    metricName: { type: String, required: true },
    metricValue: { type: Number, required: true },
    evaluationMethod: { type: String, required: true },
    experimentName: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model("EvaluationResult", evaluationResultSchema);
