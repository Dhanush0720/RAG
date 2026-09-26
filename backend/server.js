import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./src/config/db.js";
import errorHandler from "./src/middleware/errorHandler.js";

import authRoutes from "./src/routes/authRoutes.js";
import documentRoutes from "./src/routes/documentRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";
import summaryRoutes from "./src/routes/summaryRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";
import evaluationRoutes from "./src/routes/evaluationRoutes.js";
import auditRoutes from "./src/routes/auditRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api", apiLimiter);

// Static (only for locally stored, access-controlled downloads if needed)
app.use("/uploads", express.static(path.join(__dirname, process.env.UPLOAD_DIR || "uploads")));

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", service: "lexirag-backend" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/summaries", summaryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/evaluation", evaluationRoutes);
app.use("/api/audits", auditRoutes);
app.use("/api/admin", adminRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// Central error handler (never leaks stack traces in production)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`LexiRAG backend running on port ${PORT}`));
});

export default app;
