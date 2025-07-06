const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const cacheMiddleware = require("../middlewares/cacheMiddleware");
const CacheUtils = require("../utils/cacheUtils");
const Request = require("../models/requestModel");
const User = require("../models/userModel");
const Transaction = require("../models/transactionModel");

//get allrequests by user
router.get(
  "/get-all-requests-by-user",
  authMiddleware,
  cacheMiddleware((req) => CacheUtils.getUserRequestsKey(req.userId), 900),
  async (req, res) => {
    try {
      const userId = req.userId;

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
  }
);

//send request to another user
router.post("/send-request", authMiddleware, async (req, res) => {
  try {
    const { receiver, amount, reference } = req.body;

    if (!receiver || !amount || !reference) {
      return res.status(400).json({
        message: "Receiver, amount, and reference are required",
        success: false,
      });
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        message: "Please enter a valid amount",
        success: false,
      });
    }

    const cacheKey = `user:${receiver}`;
    let receiverUser = await CacheUtils.getFromCache(cacheKey);

    if (!receiverUser) {
      receiverUser = await User.findById(receiver);
      if (receiverUser) {
        await CacheUtils.setCache(cacheKey, receiverUser, 1800);
      }
    }

    if (!receiverUser) {
      return res.status(404).json({
        message: "Receiver not found",
        success: false,
      });
    }

    if (req.userId === receiver) {
      return res.status(400).json({
        message: "Cannot send request to yourself",
        success: false,
      });
    }

    const request = new Request({
      sender: req.userId,
      receiver,
      amount: parseFloat(amount),
      reference,
      status: "pending",
    });

    await request.save();

    await CacheUtils.invalidateRequestCache(req.userId);
    await CacheUtils.invalidateRequestCache(receiver);

    res.send({
      data: request,
      message: "Request sent successfully",
      success: true,
    });
  } catch (error) {
    console.error("Send request error:", error);
    res.status(500).json({
      error: error.message,
      message: "Failed to send request",
      success: false,
    });
  }
});

//update request statu
router.post("/update-request-status", authMiddleware, async (req, res) => {
  try {
    const { requestId, status } = req.body;

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

    const requestCacheKey = `request:${requestId}`;
    let request = await CacheUtils.getFromCache(requestCacheKey);

    if (!request) {
      request = await Request.findById(requestId).populate("sender receiver");
      if (request) {
        await CacheUtils.setCache(requestCacheKey, request, 600); // 10 minutes
      }
    } else {
      request = await Request.findById(requestId).populate("sender receiver");
    }

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
        success: false,
      });
    }

    if (request.receiver._id.toString() !== req.userId) {
      console.log("Receiver ID:", request.receiver._id);
      console.log("User ID:", req.userId);
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

      // Get receiver user with caching
      const receiverCacheKey = `user:${request.receiver._id}`;
      let receiverUser = await CacheUtils.getFromCache(receiverCacheKey);

      if (!receiverUser) {
        receiverUser = await User.findById(request.receiver._id);
        if (receiverUser) {
          await CacheUtils.setCache(receiverCacheKey, receiverUser, 1800);
        }
      }

      if (receiverUser.balance < amount) {
        return res.status(400).json({
          message: "Insufficient balance to accept the request",
          success: false,
        });
      }

      await User.findByIdAndUpdate(request.receiver._id, {
        $inc: { balance: -amount },
      });
      await User.findByIdAndUpdate(request.sender._id, {
        $inc: { balance: amount },
      });

      const transaction = new Transaction({
        sender: request.receiver._id,
        receiver: request.sender._id,
        amount: request.amount,
        reference: request.reference,
        status: "success",
        type: "request",
      });

      await transaction.save();
      await CacheUtils.invalidateUserCache(request.receiver._id.toString());
      await CacheUtils.invalidateUserCache(request.sender._id.toString());

      await CacheUtils.invalidateTransactionCache(
        request.receiver._id.toString()
      );
      await CacheUtils.invalidateTransactionCache(
        request.sender._id.toString()
      );
    }

    request.status = status;
    await request.save();

    await CacheUtils.invalidateRequestCache(request.sender._id.toString());
    await CacheUtils.invalidateRequestCache(request.receiver._id.toString());

    await CacheUtils.deleteFromCache(requestCacheKey);

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

//get pendibg requests for user
router.get(
  "/get-pending-requests",
  authMiddleware,
  cacheMiddleware((req) => `pending-requests:${req.userId}`, 300),
  async (req, res) => {
    try {
      const userId = req.userId;

      const pendingRequests = await Request.find({
        receiver: userId,
        status: "pending",
      })
        .populate("sender")
        .populate("receiver")
        .sort({ createdAt: -1 });

      res.send({
        data: pendingRequests,
        message: "Pending requests fetched successfully",
        success: true,
      });
    } catch (error) {
      console.error("Fetch pending requests error:", error);
      res.status(500).json({
        error: error.message,
        message: "Failed to fetch pending requests",
        success: false,
      });
    }
  }
);

//get sent requests by user
router.get(
  "/get-sent-requests",
  authMiddleware,
  cacheMiddleware((req) => `sent-requests:${req.userId}`, 600),
  async (req, res) => {
    try {
      const userId = req.userId;

      const sentRequests = await Request.find({
        sender: userId,
      })
        .populate("sender")
        .populate("receiver")
        .sort({ createdAt: -1 });

      res.send({
        data: sentRequests,
        message: "Sent requests fetched successfully",
        success: true,
      });
    } catch (error) {
      console.error("Fetch sent requests error:", error);
      res.status(500).json({
        error: error.message,
        message: "Failed to fetch sent requests",
        success: false,
      });
    }
  }
);

module.exports = router;
