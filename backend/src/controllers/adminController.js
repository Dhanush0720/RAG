import User from "../models/User.js";
import Document from "../models/Document.js";
import Summary from "../models/Summary.js";
import Conversation from "../models/Conversation.js";

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

export const getStatistics = async (req, res, next) => {
  try {
    const [totalUsers, totalDocuments, totalSummaries, totalConversations, languageBreakdown] = await Promise.all([
      User.countDocuments(),
      Document.countDocuments(),
      Summary.countDocuments(),
      Conversation.countDocuments(),
      Document.aggregate([
        { $group: { _id: "$detectedLanguage", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      totalUsers,
      totalDocuments,
      totalSummaries,
      totalConversations,
      languageBreakdown,
    });
  } catch (err) {
    next(err);
  }
};
