import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "legal_professional", "admin"],
      default: "student",
    },
    preferredLanguage: { type: String, enum: ["en", "te", "hi"], default: "en" },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });

export default mongoose.model("User", userSchema);
