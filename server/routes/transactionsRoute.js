const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const cacheMiddleware = require("../middlewares/cacheMiddleware");
const CacheUtils = require("../utils/cacheUtils");
const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

const stripe = require("stripe")(process.env.STRIPE_KEY);
const { v4: uuid } = require("uuid");

//helper function to verify transaction PIN
const verifyTransactionPin = async (userId, transactionPin) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (user.authProvider === "google" && !user.transactionPin) {
      return {
        success: false,
        message: "Transaction PIN not set. Please set your PIN first.",
        code: "PIN_NOT_SET",
      };
    }

    if (!user.transactionPin) {
      return {
        success: false,
        message: "Transaction PIN not found",
        code: "PIN_NOT_SET",
      };
    }

    const validPin = await bcrypt.compare(transactionPin, user.transactionPin);
    if (!validPin) {
      return { success: false, message: "Invalid transaction PIN" };
    }

    return { success: true, message: "PIN verified successfully" };
  } catch (error) {
    console.error("PIN verification error:", error);
    return { success: false, message: "PIN verification failed" };
  }
};

//add route to verify PIN separatel
router.post("/verify-transaction-pin", authMiddleware, async (req, res) => {
  try {
    const { transactionPin } = req.body;

    if (!transactionPin) {
      return res.send({
        success: false,
        message: "Transaction PIN is required",
      });
    }

    const pinVerification = await verifyTransactionPin(
      req.userId,
      transactionPin
    );
    return res.send(pinVerification);
  } catch (error) {
    console.error("PIN verification route error:", error);
    return res.send({
      success: false,
      message: "PIN verification failed",
    });
  }
});

//Transfer funds with PIN verification
router.post("/transfer-funds", authMiddleware, async (req, res) => {
  try {
    const { transactionPin, ...transactionData } = req.body;

    if (!transactionPin) {
      return res.send({
        message: "Transaction PIN is required",
        success: false,
      });
    }

    const pinVerification = await verifyTransactionPin(
      req.userId,
      transactionPin
    );
    if (!pinVerification.success) {
      return res.send({
        message: pinVerification.message,
        success: false,
        code: pinVerification.code,
      });
    }

    const sender = await User.findById(transactionData.sender);
    if (!sender) {
      return res.send({
        message: "Sender not found",
        success: false,
      });
    }

    if (sender.balance < transactionData.amount) {
      return res.send({
        message: "Insufficient balance",
        success: false,
      });
    }

    const newTransaction = new Transaction(transactionData);
    await newTransaction.save();

    await User.findByIdAndUpdate(transactionData.sender, {
      $inc: { balance: -transactionData.amount },
    });

    await User.findByIdAndUpdate(transactionData.receiver, {
      $inc: { balance: transactionData.amount },
    });

    await CacheUtils.invalidateUserCache(transactionData.sender);
    await CacheUtils.invalidateUserCache(transactionData.receiver);
    await CacheUtils.invalidateTransactionCache(transactionData.sender);
    await CacheUtils.invalidateTransactionCache(transactionData.receiver);

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

//verify accountt
router.post(
  "/verify-account",
  authMiddleware,
  cacheMiddleware((req) => `verify-account:${req.body.receiver}`, 1800),
  async (req, res) => {
    try {
      const user = await User.findById(req.body.receiver).select("-password");
      if (user) {
        res.send({
          message: "Account verified",
          data: {
            name: `${user.firstName} ${user.lastName}`,
            accountNumber: user._id,
            bankName: "Transacto Wallet",
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
  }
);

//get all transactions for a user
router.post(
  "/get-all-transactions-by-user",
  authMiddleware,
  cacheMiddleware(
    (req) => CacheUtils.getUserTransactionsKey(req.body.userId),
    900
  ),
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
        message: "transactions fetch failed",
        data: error.message,
        success: false,
      });
    }
  }
);

//deposit funds with proper PIN verification
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
      transactionPin,
    } = req.body;

    if (!userId || !amount || !paymentMethod || !reference) {
      return res.send({
        success: false,
        message:
          "Missing required fields: userId, amount, paymentMethod, or reference",
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.send({
        success: false,
        message: "Invalid amount",
      });
    }

    if (!transactionPin) {
      return res.send({
        success: false,
        message: "Transaction PIN is required",
        code: "PIN_REQUIRED",
      });
    }

    const pinVerification = await verifyTransactionPin(userId, transactionPin);
    if (!pinVerification.success) {
      return res.send({
        message: pinVerification.message,
        success: false,
        code: pinVerification.code,
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

    if (paymentMethod === "card" && paymentMethodId) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: "inr",
          payment_method: paymentMethodId,
          confirm: true,
          return_url: `${process.env.FRONTEND_URL}/transactions`,
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
      transactionData.status = "pending";

      if (paymentMethod === "bank_transfer" && bankDetails) {
        transactionData.bankDetails = bankDetails;
      }

      if (paymentMethod === "upi" && upiDetails) {
        transactionData.upiDetails = upiDetails;
      }
    }

    const newTransaction = new Transaction(transactionData);
    await newTransaction.save();

    if (transactionData.status === "success") {
      await User.findByIdAndUpdate(userId, {
        $inc: { balance: parseFloat(amount) },
      });

      await CacheUtils.invalidateUserCache(userId);
      await CacheUtils.invalidateTransactionCache(userId);
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

module.exports = router;
