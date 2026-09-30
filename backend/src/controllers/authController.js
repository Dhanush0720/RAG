import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendPasswordResetEmail } from "../services/emailService.js";

const signToken = (user) => {
  const secret = process.env.JWT_SECRET || "lexirag_default_jwt_secret_dev_fallback_2024_secure_key";
  return jwt.sign({ id: user._id, role: user.role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  preferredLanguage: user.preferredLanguage,
  createdAt: user.createdAt,
});

export const register = async (req, res, next) => {
  try {
    const { name, email, password, preferredLanguage, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: "An account with this email already exists." });

    // Security: users can never self-assign admin. Only 'student' or 'legal_professional'
    // may be chosen at registration; admin accounts are provisioned separately (e.g. seed script or by another admin).
    const allowedSelfRoles = ["student", "legal_professional"];
    const finalRole = allowedSelfRoles.includes(role) ? role : "student";

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: finalRole,
      preferredLanguage: ["en", "te", "hi"].includes(preferredLanguage) ? preferredLanguage : "en",
    });

    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: "Invalid email or password." });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: "Invalid email or password." });

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Please provide an email address." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return a safe response so attackers cannot easily enumerate user emails
      return res.json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent to it.",
      });
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    // Store hashed token in database
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const emailResult = await sendPasswordResetEmail({
      toEmail: user.email,
      resetToken,
      userName: user.name,
    });

    res.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent to it.",
      simulated: emailResult.simulated || false,
      resetUrl: emailResult.simulated ? emailResult.resetUrl : undefined,
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Reset token and new password are required." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Password reset link is invalid or has expired." });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      success: true,
      message: "Your password has been successfully reset! You can now log in.",
    });
  } catch (err) {
    next(err);
  }
};

