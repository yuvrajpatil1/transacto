const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    monthlyBudget: {
      type: Number,
      required: true,
      default: 0,
    },
    categoryBudgets: {
      Food: { type: Number, default: 0 },
      Transport: { type: Number, default: 0 },
      Entertainment: { type: Number, default: 0 },
      Utilities: { type: Number, default: 0 },
      Healthcare: { type: Number, default: 0 },
      Shopping: { type: Number, default: 0 },
      Other: { type: Number, default: 0 },
    },
    period: {
      type: String,
      enum: ["monthly", "weekly", "yearly"],
      default: "monthly",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Budget", budgetSchema);
