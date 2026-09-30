import mongoose from "mongoose";
import dns from "node:dns";

const connectDB = async () => {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
  } catch (err) {
    // Keep default resolver if setting DNS servers fails
  }

  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/lexirag";
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB connected");
  } catch (err) {
    console.warn(`Primary MongoDB connection (${uri}) failed: ${err.message}`);
    // If primary was Atlas and failed, try local fallback
    if (uri !== "mongodb://localhost:27017/lexirag") {
      try {
        console.log("Attempting fallback to local MongoDB (mongodb://localhost:27017/lexirag)...");
        await mongoose.connect("mongodb://localhost:27017/lexirag", { serverSelectionTimeoutMS: 3000 });
        console.log("Fallback local MongoDB connected successfully");
        return;
      } catch (localErr) {
        console.error("Local MongoDB fallback also failed:", localErr.message);
      }
    }
    console.error("MongoDB connection failed:", err.message);
    console.error("Set MONGO_URI in backend/.env to a running MongoDB instance (local or Atlas).");
    process.exit(1);
  }
};

export default connectDB;

