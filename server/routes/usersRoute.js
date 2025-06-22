const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email templates (keeping your existing template)
const getVerificationEmailTemplate = (userName, userEmail) => {
  return {
    subject: "Account Verified - Welcome to Transacto!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Transacto</h1>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;"> Account Verified Successfully!</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Dear ${userName},
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Great news! Your Transacto account has been successfully verified by our security team. 
            You can now access all features of your digital wallet.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin: 0 0 10px 0;">What's Next?</h3>
            <ul style="color: #666; margin: 0; padding-left: 20px;">
              <li>Log in to your account</li>
              <li>Set up your wallet preferences</li>
              <li>Start making secure transactions</li>
              <li>Explore our premium features</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${"https://transacto01.onrender.com"}/login" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 6px; 
                      font-weight: bold;
                      display: inline-block;">
              Login to Your Account
            </a>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #1976d2; margin: 0; font-size: 14px;">
              <strong>Security Tip:</strong> Never share your login credentials with anyone. 
              Transacto will never ask for your password via email.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If you have any questions or need assistance, please don't hesitate to contact our support team.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            The Transacto Team
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© 2025 Transacto. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `,
  };
};

// Register User (Updated to handle both regular and OAuth users)
router.post("/register", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.send({
        success: false,
        message: "User already exists!",
      });
    }

    // Only hash password if it's provided (not for OAuth users)
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      req.body.password = hashedPassword;
    }

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

// Login User (Updated to handle OAuth users)
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found!",
      });
    }

    // Check if user is OAuth user
    if (user.authProvider === "google") {
      return res.status(400).send({
        success: false,
        message: "Please login using Google OAuth",
        code: "OAUTH_USER",
      });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).send({
        success: false,
        message: "Invalid password!",
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).send({
        success: false,
        message: "User is not verified yet or has been suspended",
        code: "USER_NOT_VERIFIED",
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
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

// Get User Info (keeping your existing implementation)
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

// Get all users (keeping your existing implementation)
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

// Send verification email (keeping your existing implementation)
router.post("/send-verification-email", authMiddleware, async (req, res) => {
  try {
    const { userId, userName, userEmail } = req.body;

    if (!userId || !userEmail) {
      return res.status(400).send({
        success: false,
        message: "Missing required fields: userId and userEmail",
      });
    }

    const emailTemplate = getVerificationEmailTemplate(
      userName || "User",
      userEmail
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    };

    await transporter.sendMail(mailOptions);

    res.send({
      success: true,
      message: "Verification email sent successfully",
      data: null,
    });
  } catch (error) {
    console.error("Send verification email error:", error);
    res.status(500).send({
      success: false,
      message: "Failed to send verification email",
      error: error.message,
    });
  }
});

// Update user verified status (keeping your existing implementation)
router.post(
  "/update-user-verified-status",
  authMiddleware,
  async (req, res) => {
    try {
      const { selectedUser, isVerified } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        selectedUser,
        { isVerified: isVerified },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).send({
          success: false,
          message: "User not found",
        });
      }

      if (isVerified) {
        try {
          const emailTemplate = getVerificationEmailTemplate(
            updatedUser.firstName || updatedUser.name || "User",
            updatedUser.email
          );

          console.log(updatedUser.email);
          console.log(emailTemplate);

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: updatedUser.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          };

          await transporter.sendMail(mailOptions);
          console.log(`Verification email sent to ${updatedUser.email}`);
        } catch (emailError) {
          console.error("Error sending verification email:", emailError);
        }
      }

      res.send({
        data: updatedUser,
        message: isVerified
          ? "User verified successfully and notification email sent"
          : "User verification status updated successfully",
        success: true,
      });
    } catch (error) {
      console.error("Update request status error:", error);
      res.status(500).send({
        message: error.message,
        success: false,
      });
    }
  }
);

// Generate QR (keeping your existing implementation)
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
    const baseURL = "https://transacto01.onrender.com/";
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
