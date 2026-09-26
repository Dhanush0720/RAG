import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    originalFileName: { type: String, required: true },
    fileType: { type: String, enum: ["pdf", "docx", "txt"], required: true },
    filePath: { type: String, required: true },
    detectedLanguage: { type: String, default: null },
    selectedLanguage: { type: String, enum: ["en", "te", "hi", "auto"], default: "auto" },
    status: {
      type: String,
      enum: ["uploaded", "processing", "indexed", "failed"],
      default: "uploaded",
    },
    pageCount: { type: Number, default: 0 },
    processingError: { type: String, default: null },
  },
  { timestamps: true }
);

documentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Document", documentSchema);
