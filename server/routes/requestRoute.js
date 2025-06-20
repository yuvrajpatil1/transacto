const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const Request = require("../models/requestModel");
const User = require("../models/userModel");
const Transaction = require("../models/transactionModel");

// Change from POST to GET
router.get("/get-all-requests-by-user", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // This will work now with proper body parsing

    const requests = await Request.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender")
      .populate("receiver")
      .sort({ createdAt: -1 });

    res.send({
      data: requests,
      message: "Requests fetched successfully",
      success: true,
    });
  } catch (error) {
    console.error("Fetch requests error:", error);
    res.status(500).json({
      error: error.message,
      message: "Failed to fetch requests",
      success: false,
    });
  }
});

//send request to another user
router.post("/send-request", authMiddleware, async (req, res) => {
  try {
    const { receiver, amount, reference } = req.body;

    // Validate required fields
    if (!receiver || !amount || !reference) {
      return res.status(400).json({
        message: "Receiver, amount, and reference are required",
        success: false,
      });
    }

    // Validate amount
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        message: "Please enter a valid amount",
        success: false,
      });
    }

    // Check if receiver exists
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res.status(404).json({
        message: "Receiver not found",
        success: false,
      });
    }

    // Check if user is not sending request to themselves
    if (req.body.userId === receiver) {
      return res.status(400).json({
        message: "Cannot send request to yourself",
        success: false,
      });
    }

    const request = new Request({
      sender: req.body.userId,
      receiver,
      amount: parseFloat(amount),
      reference,
      status: "pending",
    });

    await request.save();

    res.send({
      data: request,
      message: "Request sent successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Failed to send request",
      success: false,
    });
  }
});

// Update request status (accept/reject)
router.post("/update-request-status", authMiddleware, async (req, res) => {
  try {
    const { requestId, status } = req.body;

    // Validate input
    if (!requestId || !status) {
      return res.status(400).json({
        message: "Request ID and status are required",
        success: false,
      });
    }

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be either 'accepted' or 'rejected'",
        success: false,
      });
    }

    // Fetch and populate request
    const request = await Request.findById(requestId).populate(
      "sender receiver"
    );

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
        success: false,
      });
    }

    if (request.receiver._id.toString() !== req.userId) {
      console.log(request.receiver._id);
      console.log(req.userId);
      return res.status(403).json({
        message: "You can only update requests sent to you",
        success: false,
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Request has already been processed",
        success: false,
      });
    }

    if (status === "accepted") {
      const amount = request.amount;

      const receiverUser = await User.findById(request.receiver._id);
      if (receiverUser.balance < amount) {
        return res.status(400).json({
          message: "Insufficient balance to accept the request",
          success: false,
        });
      }

      // Update balances
      await User.findByIdAndUpdate(request.receiver._id, {
        $inc: { balance: -amount },
      });
      await User.findByIdAndUpdate(request.sender._id, {
        $inc: { balance: amount },
      });

      // Create transaction
      const transaction = new Transaction({
        sender: request.receiver._id, // receiver is sending money
        receiver: request.sender._id, // sender is receiving it
        amount: request.amount,
        reference: request.reference,
        status: "success",
        type: "request", // Required field
      });

      await transaction.save();
    }

    // Update status
    request.status = status;
    await request.save();

    res.send({
      data: request,
      message: `Request ${status} successfully`,
      success: true,
    });
  } catch (error) {
    console.error("Update request status error:", error);
    res.status(500).json({
      message: "Failed to update request status",
      error: error.message,
      success: false,
    });
  }
});

module.exports = router;
