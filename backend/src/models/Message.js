import mongoose from "mongoose";

const citationSchema = new mongoose.Schema(
  {
    documentName: String,
    page: Number,
    chunkIndex: Number,
    excerpt: String,
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    citations: { type: [citationSchema], default: [] },
    confidence: { type: String, enum: ["high", "medium", "low", "unsupported"], default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model("Message", messageSchema);
