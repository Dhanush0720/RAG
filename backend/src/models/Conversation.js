import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true },
    title: { type: String, default: "New conversation" },
    language: { type: String, enum: ["en", "te", "hi"], default: "en" },
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
