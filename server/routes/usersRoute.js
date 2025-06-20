const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const QRCode = require("qrcode");

// Register User
router.post("/register", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.send({
        success: false,
        message: "User already exists!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    const newUser = new User(req.body);
    await newUser.save();

    res.send({
      message: "User Created Successfully!",
      data: null,
      success: true,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

// Login User
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.send({
        success: false,
        message: "User not found!",
      });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      return res.send({
        success: false,
        message: "Invalid password!",
      });
    }

    // check if user is verified

    if (!user.isVerified) {
      return res.send({
        success: false,
        message: "User is not verified yet or has been suspended",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.send({
      message: "User logged in successfully!",
      data: token,
      success: true,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

// Get User Info
router.post("/get-user-info", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    console.log(req.userId + "Yuv");
    user.password = "";

    res.send({
      message: "User info fetched successfully",
      data: user,
      success: true,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

//get all users
router.get("/get-all-users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find();
    res.send({
      message: "Users fetched successfully",
      data: users,
      success: true,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

//update user verified status
router.post(
  "/update-user-verified-status",
  authMiddleware,
  async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.body.selectedUser, {
        isVerified: req.body.isVerified,
      });
      res.send({
        data: null,
        message: "User verified status updated successfully",
        success: true,
      });
    } catch (error) {
      console.error("Update request status error:", error);
      res.send({
        message: error.message,
        success: false,
      });
    }
  }
);

router.get("/generate-qr", authMiddleware, async (req, res) => {
  console.log("QR Code route hit! User ID:", req.userId);

  const userId = req.userId;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Missing user ID",
    });
  }

  try {
    const baseURL = process.env.FRONTEND_URL || "http://localhost:5173";
    const qrCodeURL = `${baseURL}/user/${userId}`;

    const qrCodeData = await QRCode.toDataURL(qrCodeURL, {
      width: 256,
      margin: 2,
    });

    res.json({
      success: true,
      data: qrCodeData,
      url: qrCodeURL,
      message: "QR Code generated successfully",
    });
  } catch (err) {
    console.error("QR Code generation error:", err);
    res.status(500).json({
      success: false,
      message: "Error generating QR code",
    });
  }
});

module.exports = router;
