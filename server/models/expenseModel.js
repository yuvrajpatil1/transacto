// const mongoose = require("mongoose");

// const expenseSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     amount: {
//       type: Number,
//       required: true,
//     },
//     category: {
//       type: String,
//       required: true,
//       enum: [
//         "Food",
//         "Transport",
//         "Entertainment",
//         "Utilities",
//         "Healthcare",
//         "Shopping",
//         "Other",
//       ],
//     },
//     type: {
//       type: String,
//       enum: ["expense", "income"],
//       default: "expense",
//     },
//     date: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("Expense", expenseSchema);
