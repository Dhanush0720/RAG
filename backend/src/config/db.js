import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/lexirag";
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.error("Set MONGO_URI in backend/.env to a running MongoDB instance (local or Atlas).");
    process.exit(1);
  }
};

export default connectDB;
