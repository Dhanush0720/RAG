import "dotenv/config";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

async function main() {
  await connectDB();

  // 1. Promote target email if provided via CLI or env
  const targetEmail = process.argv[2] || process.env.PROMOTE_EMAIL;
  if (targetEmail) {
    const promoted = await User.updateMany(
      { email: targetEmail.toLowerCase() },
      { $set: { role: "admin" } }
    );
    console.log(`Promoted user ${targetEmail}:`, promoted.modifiedCount);
  }

  // 2. Ensure default admin account exists
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@lexirag.com";
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@12345";
  let admin = await User.findOne({ email: adminEmail });
  const hash = await bcrypt.hash(adminPassword, 12);
  if (!admin) {
    admin = await User.create({
      name: "System Admin",
      email: adminEmail,
      passwordHash: hash,
      role: "admin",
      preferredLanguage: "en",
    });
    console.log("Created dedicated admin account:", adminEmail);
  } else {
    admin.role = "admin";
    admin.passwordHash = hash;
    await admin.save();
    console.log("Updated dedicated admin account:", adminEmail);
  }

  const allAdmins = await User.find({ role: "admin" }, "name email role");
  console.log("Active Admin Accounts:", JSON.stringify(allAdmins, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
