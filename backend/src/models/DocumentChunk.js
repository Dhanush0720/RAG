import mongoose from "mongoose";

// Chunk text is authoritative here; the AI service also keeps vectors in FAISS
// keyed by the same chunkId so Node never needs to talk to the vector store directly.
const documentChunkSchema = new mongoose.Schema(
  {
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true, index: true },
    chunkIndex: { type: Number, required: true },
    content: { type: String, required: true },
    pageNumber: { type: Number, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

documentChunkSchema.index({ documentId: 1, chunkIndex: 1 });

export default mongoose.model("DocumentChunk", documentChunkSchema);
