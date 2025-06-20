const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");

const stripe = require("stripe")(process.env.STRIPE_KEY);
const { v4: uuid } = require("uuid");

// Transfer funds
router.post("/transfer-funds", authMiddleware, async (req, res) => {
  try {
    // Save transaction
    const newTransaction = new Transaction(req.body);
    await newTransaction.save();

    // Decrease sender's balance
    await User.findByIdAndUpdate(req.body.sender, {
      $inc: { balance: -req.body.amount },
    });

    // Increase receiver's balance
    await User.findByIdAndUpdate(req.body.receiver, {
      $inc: { balance: req.body.amount },
    });

    res.send({
      message: "Transaction successful",
      data: newTransaction,
      success: true,
    });
  } catch (error) {
    res.send({
      message: "Transaction failed",
      data: error.message,
      success: false,
    });
  }
});

// Verify account
router.post("/verify-account", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.body.receiver).select("-password");
    if (user) {
      res.send({
        message: "Account verified",
        data: {
          name: `${user.firstName} ${user.lastName}`,
          accountNumber: user._id,
          bankName: "SecurePay Wallet",
        },
        success: true,
      });
    } else {
      res.send({
        message: "Account not found",
        data: null,
        success: false,
      });
    }
  } catch (error) {
    res.send({
      message: "Something went wrong",
      data: error.message,
      success: false,
    });
  }
});

//get all txns for a user
router.post(
  "/get-all-transactions-by-user",
  authMiddleware,
  async (req, res) => {
    try {
      const transactions = await Transaction.find({
        $or: [{ sender: req.body.userId }, { receiver: req.body.userId }],
      }).sort({ createdAt: -1 });
      res.send({
        message: "transactions fetched",
        data: transactions,
        success: true,
      });
    } catch (error) {
      res.send({
        message: "transactions fetched",
        data: error.message,
        success: false,
      });
    }
  }
);

// Deposit funds using stripe
router.post("/deposit-funds", authMiddleware, async (req, res) => {
  try {
    const {
      userId,
      amount,
      paymentMethod,
      paymentMethodId,
      reference,
      bankDetails,
      upiDetails,
    } = req.body;

    // Validate required fields
    if (!userId || !amount || !paymentMethod || !reference) {
      return res.send({
        success: false,
        message:
          "Missing required fields: userId, amount, paymentMethod, or reference",
      });
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return res.send({
        success: false,
        message: "Invalid amount",
      });
    }

    let transactionData = {
      sender: userId,
      receiver: userId,
      amount: parseFloat(amount),
      type: "deposit",
      reference: reference,
      paymentMethod: paymentMethod,
      userId: userId,
    };

    // Handle different payment methods
    if (paymentMethod === "card" && paymentMethodId) {
      try {
        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert ₹ to paise
          currency: "inr",
          payment_method: paymentMethodId,
          confirm: true,
          return_url: "http://localhost:5173/transactions",
          description: `Deposit to wallet - ${reference}`,
          metadata: {
            userId: userId,
            type: "deposit",
          },
        });

        if (paymentIntent.status === "succeeded") {
          transactionData.status = "success";
          transactionData.paymentMethodId = paymentMethodId;
          transactionData.stripeChargeId = paymentIntent.id;
        } else {
          return res.send({
            success: false,
            message: "Payment failed",
            data: paymentIntent,
          });
        }
      } catch (stripeError) {
        console.error("Stripe Error:", stripeError);
        return res.send({
          success: false,
          message: stripeError.message || "Payment processing failed",
        });
      }
    } else {
      // For bank transfer and UPI, set status as pending
      transactionData.status = "pending";

      if (paymentMethod === "bank_transfer" && bankDetails) {
        transactionData.bankDetails = bankDetails;
      }

      if (paymentMethod === "upi" && upiDetails) {
        transactionData.upiDetails = upiDetails;
      }
    }

    // Save transaction to database
    const newTransaction = new Transaction(transactionData);
    await newTransaction.save();

    // Update user balance only for successful card payments
    if (transactionData.status === "success") {
      await User.findByIdAndUpdate(userId, {
        $inc: { balance: parseFloat(amount) },
      });
    }

    return res.send({
      success: true,
      message:
        transactionData.status === "success"
          ? "Deposit successful!"
          : "Deposit request submitted successfully! It will be processed within 1-2 business days.",
      data: newTransaction,
    });
  } catch (error) {
    console.error("Deposit Error:", error);
    return res.send({
      success: false,
      message: "Transaction failed",
      data: error.message,
    });
  }
});

// Deposit funds using stripe
// router.post("/deposit-funds", authMiddleware, async (req, res) => {
//   try {
//     const {
//       userId,
//       amount,
//       reference,
//       paymentMethod,
//       bankDetails,
//       status,
//       type,
//       timestamp,
//     } = req.body;

//     const newTransaction = new Transaction({
//       sender: userId,
//       receiver: userId, // since deposit is to self
//       amount,
//       reference,
//       status,
//       type,
//       paymentMethod,
//       bankDetails,
//       createdAt: timestamp,
//     });

//     await newTransaction.save();

//     // Optionally, update balance instantly or wait for admin approval
//     await User.findByIdAndUpdate(userId, {
//       $inc: { balance: amount },
//     });

//     res.send({
//       message: "Deposit request submitted",
//       data: newTransaction,
//       success: true,
//     });
//   } catch (error) {
//     res.send({
//       message: "Deposit failed",
//       data: error.message,
//       success: false,
//     });
//   }
// });

module.exports = router;
