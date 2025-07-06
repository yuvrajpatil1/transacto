const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const cacheMiddleware = require("../middlewares/cacheMiddleware");
const CacheUtils = require("../utils/cacheUtils");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//mail template
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
            <a href="${"https://transacto.onrender.com"}/login" 
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

//register User
router.post("/register", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.send({
        success: false,
        message: "User already exists!",
      });
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      req.body.password = hashedPassword;
    }

    const newUser = new User(req.body);
    await newUser.save();

    await CacheUtils.del(CacheUtils.getAllUsersKey());

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

//login User
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found!",
      });
    }

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

//get User Info
router.post(
  "/get-user-info",
  authMiddleware,
  cacheMiddleware((req) => CacheUtils.getUserKey(req.userId), 1800),
  async (req, res) => {
    try {
      const user = await User.findById(req.userId);
      console.log(req.userId + "Yuv");
      user.password = "";
      user.transactionPin = "";

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
  }
);

//get all users
router.get(
  "/get-all-users",
  authMiddleware,
  cacheMiddleware(CacheUtils.getAllUsersKey(), 1800),
  async (req, res) => {
    try {
      const users = await User.find();
      const sanitizedUsers = users.map((user) => {
        const userObj = user.toObject();
        userObj.password = "";
        userObj.transactionPin = "";
        return userObj;
      });

      res.send({
        message: "Users fetched successfully",
        data: sanitizedUsers,
        success: true,
      });
    } catch (error) {
      res.send({
        message: error.message,
        success: false,
      });
    }
  }
);

//verify Transaction PIN endpoint
router.post("/verify-transaction-pin", authMiddleware, async (req, res) => {
  try {
    const { transactionPin } = req.body;

    if (!transactionPin) {
      return res.status(400).send({
        success: false,
        message: "Transaction PIN is required",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    if (user.authProvider === "google" && !user.transactionPin) {
      return res.status(400).send({
        success: false,
        message: "Transaction PIN not set for OAuth users",
        code: "PIN_NOT_SET",
      });
    }

    const validPin = await bcrypt.compare(transactionPin, user.transactionPin);

    if (!validPin) {
      return res.status(401).send({
        success: false,
        message: "Invalid transaction PIN",
      });
    }

    res.send({
      success: true,
      message: "Transaction PIN verified successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

//update Transaction PIN endpoint
router.post("/update-transaction-pin", authMiddleware, async (req, res) => {
  try {
    const { currentPin, newPin } = req.body;

    if (!currentPin || !newPin) {
      return res.status(400).send({
        success: false,
        message: "Current PIN and new PIN are required",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    if (user.authProvider === "google" && !user.transactionPin) {
      const salt = await bcrypt.genSalt(12);
      const hashedNewPin = await bcrypt.hash(newPin, salt);

      await User.findByIdAndUpdate(req.userId, {
        transactionPin: hashedNewPin,
      });

      await CacheUtils.invalidateUserCache(req.userId);

      return res.send({
        success: true,
        message: "Transaction PIN set successfully",
      });
    }

    const validCurrentPin = await bcrypt.compare(
      currentPin,
      user.transactionPin
    );

    if (!validCurrentPin) {
      return res.status(401).send({
        success: false,
        message: "Invalid current transaction PIN",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedNewPin = await bcrypt.hash(newPin, salt);

    await User.findByIdAndUpdate(req.userId, {
      transactionPin: hashedNewPin,
    });

    await CacheUtils.invalidateUserCache(req.userId);

    res.send({
      success: true,
      message: "Transaction PIN updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

//send verification email
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

//update user verified status
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

      await CacheUtils.invalidateUserCache(selectedUser);

      if (isVerified) {
        try {
          const emailTemplate = getVerificationEmailTemplate(
            updatedUser.firstName || updatedUser.name || "User",
            updatedUser.email
          );

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

//generate QR
router.get(
  "/generate-qr",
  authMiddleware,
  cacheMiddleware((req) => CacheUtils.getQRCodeKey(req.userId), 7200),
  async (req, res) => {
    console.log("QR Code route hit! User ID:", req.userId);

    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing user ID",
      });
    }

    try {
      const baseURL = "https://transacto.onrender.com/";
      // const baseURL = "http://localhost:5173/";
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
  }
);

const otpStore = new Map();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getOTPEmailTemplate = (userName, otp) => {
  return {
    subject: "Reset Transaction PIN - OTP Verification",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Transacto</h1>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Reset Transaction PIN</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Dear ${userName},
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            You have requested to reset your transaction PIN. Please use the following OTP to verify your identity:
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #667eea;">
            <h1 style="color: #667eea; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 8px;">${otp}</h1>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Important:</strong> This OTP is valid for 10 minutes only. Do not share this code with anyone.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If you didn't request this PIN reset, please ignore this email or contact our support team immediately.
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

//send OTP for PIN reset
router.post("/send-pin-reset-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "No account found with this email address",
      });
    }

    if (!user.isVerified) {
      return res.status(403).send({
        success: false,
        message: "Account not verified. Please contact support.",
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    console.log(otp);

    otpStore.set(email, {
      otp,
      expiry: otpExpiry,
      userId: user._id,
      attempts: 0,
    });

    const emailTemplate = getOTPEmailTemplate(
      user.firstName || user.name || "User",
      otp
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    };

    await transporter.sendMail(mailOptions);

    res.send({
      success: true,
      message: "OTP sent successfully to your email",
      data: {
        email: email,
        expiresIn: "10 minutes",
      },
    });
  } catch (error) {
    console.error("Send PIN reset OTP error:", error);
    console.log(res);
    res.status(500).send({
      success: false,
      message: "Failed to send OTP. Please try again.",
    });
  }
});

//verify OTP for PIN reset
router.post("/verify-pin-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).send({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const otpData = otpStore.get(email);

    if (!otpData) {
      return res.status(400).send({
        success: false,
        message: "OTP not found or expired. Please request a new OTP.",
      });
    }

    if (new Date() > otpData.expiry) {
      otpStore.delete(email);
      return res.status(400).send({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    if (otpData.attempts >= 5) {
      otpStore.delete(email);
      return res.status(429).send({
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    if (otpData.otp !== otp) {
      otpData.attempts += 1;
      otpStore.set(email, otpData);

      return res.status(400).send({
        success: false,
        message: `Invalid OTP. ${5 - otpData.attempts} attempts remaining.`,
      });
    }
    otpData.verified = true;
    otpStore.set(email, otpData);

    res.send({
      success: true,
      message: "OTP verified successfully",
      data: {
        email: email,
        verified: true,
      },
    });
  } catch (error) {
    console.error("Verify PIN reset OTP error:", error);
    res.status(500).send({
      success: false,
      message: "OTP verification failed. Please try again.",
    });
  }
});

//reset Transaction PIN (after OTP veridication)
router.post("/reset-transaction-pin", async (req, res) => {
  try {
    const { email, otp, newPin } = req.body;

    if (!email || !otp || !newPin) {
      return res.status(400).send({
        success: false,
        message: "Email, OTP, and new PIN are required",
      });
    }

    if (newPin.length < 4 || newPin.length > 6) {
      return res.status(400).send({
        success: false,
        message: "PIN must be between 4 and 6 digits",
      });
    }

    if (!/^\d+$/.test(newPin)) {
      return res.status(400).send({
        success: false,
        message: "PIN must contain only numbers",
      });
    }

    const otpData = otpStore.get(email);

    if (!otpData || !otpData.verified) {
      return res.status(400).send({
        success: false,
        message: "OTP not verified. Please verify OTP first.",
      });
    }

    if (otpData.otp !== otp || new Date() > otpData.expiry) {
      otpStore.delete(email);
      return res.status(400).send({
        success: false,
        message: "Invalid or expired session. Please start over.",
      });
    }

    const user = await User.findById(otpData.userId);
    if (!user) {
      otpStore.delete(email);
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedNewPin = await bcrypt.hash(newPin, salt);

    await User.findByIdAndUpdate(otpData.userId, {
      transactionPin: hashedNewPin,
    });

    await CacheUtils.invalidateUserCache(otpData.userId);

    otpStore.delete(email);

    //send confirmation email
    try {
      const confirmationEmailTemplate = {
        subject: "Transaction PIN Reset Successfully",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Transacto</h1>
            </div>
            
            <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">Transaction PIN Reset Successful</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Dear ${user.firstName || user.name || "User"},
              </p>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Your transaction PIN has been successfully reset. You can now use your new PIN for transactions.
              </p>
              
              <div style="background: #d4edda; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #28a745;">
                <p style="color: #155724; margin: 0; font-size: 14px;">
                  <strong>Security Note:</strong> If you didn't make this change, please contact our support team immediately.
                </p>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                Best regards,<br>
                The Transacto Team
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>© 2025 Transacto. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: confirmationEmailTemplate.subject,
        html: confirmationEmailTemplate.html,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
    }

    res.send({
      success: true,
      message: "Transaction PIN updated successfully",
      data: {
        email: email,
        updated: true,
      },
    });
  } catch (error) {
    console.error("Reset transaction PIN error:", error);
    res.status(500).send({
      success: false,
      message: "Failed to reset PIN. Please try again.",
    });
  }
});

//eesend OTP for PIN reset
router.post("/resend-pin-reset-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "No account found with this email address",
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    otpStore.set(email, {
      otp,
      expiry: otpExpiry,
      userId: user._id,
      attempts: 0,
    });

    const emailTemplate = getOTPEmailTemplate(
      user.firstName || user.name || "User",
      otp
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    };

    await transporter.sendMail(mailOptions);

    res.send({
      success: true,
      message: "New OTP sent successfully to your email",
      data: {
        email: email,
        expiresIn: "10 minutes",
      },
    });
  } catch (error) {
    console.error("Resend PIN reset OTP error:", error);
    res.status(500).send({
      success: false,
      message: "Failed to resend OTP. Please try again.",
    });
  }
});

//store for password reset OTPs
const passwordResetOtpStore = new Map();

//mail template for password reset OTP
const getPasswordResetOTPEmailTemplate = (userName, otp) => {
  return {
    subject: "Reset Password - OTP Verification",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Transacto</h1>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Dear ${userName},
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            You have requested to reset your account password. Please use the following OTP to verify your identity:
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #667eea;">
            <h1 style="color: #667eea; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 8px;">${otp}</h1>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Important:</strong> This OTP is valid for 15 minutes only. Do not share this code with anyone.
            </p>
          </div>
          
          <div style="background: #f8d7da; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <p style="color: #721c24; margin: 0; font-size: 14px;">
              <strong>Security Alert:</strong> If you didn't request this password reset, please contact our support team immediately and secure your account.
            </p>
          </div>
          
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

//send OTP for password reset
router.post("/send-password-reset-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "No account found with this email address",
      });
    }

    if (!user.isVerified) {
      return res.status(403).send({
        success: false,
        message: "Account not verified. Please contact support.",
      });
    }

    if (user.authProvider === "google") {
      return res.status(400).send({
        success: false,
        message: "Please use Google to sign in to your account",
        code: "OAUTH_USER",
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    passwordResetOtpStore.set(email, {
      otp,
      expiry: otpExpiry,
      userId: user._id,
      attempts: 0,
    });

    const emailTemplate = getPasswordResetOTPEmailTemplate(
      user.firstName || user.name || "User",
      otp
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    };

    await transporter.sendMail(mailOptions);

    res.send({
      success: true,
      message: "Password reset OTP sent successfully to your email",
      data: {
        email: email,
        expiresIn: "15 minutes",
      },
    });
  } catch (error) {
    console.error("Send password reset OTP error:", error);
    res.status(500).send({
      success: false,
      message: "Failed to send OTP. Please try again.",
    });
  }
});

//verify OTP for password reset
router.post("/verify-password-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).send({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const otpData = passwordResetOtpStore.get(email);

    if (!otpData) {
      return res.status(400).send({
        success: false,
        message: "OTP not found or expired. Please request a new OTP.",
      });
    }

    if (new Date() > otpData.expiry) {
      passwordResetOtpStore.delete(email);
      return res.status(400).send({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    if (otpData.attempts >= 5) {
      passwordResetOtpStore.delete(email);
      return res.status(429).send({
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    if (otpData.otp !== otp) {
      otpData.attempts += 1;
      passwordResetOtpStore.set(email, otpData);

      return res.status(400).send({
        success: false,
        message: `Invalid OTP. ${5 - otpData.attempts} attempts remaining.`,
      });
    }

    otpData.verified = true;
    passwordResetOtpStore.set(email, otpData);

    res.send({
      success: true,
      message: "OTP verified successfully",
      data: {
        email: email,
        verified: true,
      },
    });
  } catch (error) {
    console.error("Verify password reset OTP error:", error);
    res.status(500).send({
      success: false,
      message: "OTP verification failed. Please try again.",
    });
  }
});

//rset password (after OTP verification)
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).send({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const otpData = passwordResetOtpStore.get(email);

    if (!otpData || !otpData.verified) {
      return res.status(400).send({
        success: false,
        message: "OTP not verified. Please verify OTP first.",
      });
    }

    if (otpData.otp !== otp || new Date() > otpData.expiry) {
      passwordResetOtpStore.delete(email);
      return res.status(400).send({
        success: false,
        message: "Invalid or expired session. Please start over.",
      });
    }

    const user = await User.findById(otpData.userId);
    if (!user) {
      passwordResetOtpStore.delete(email);
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(otpData.userId, {
      password: hashedNewPassword,
    });

    await CacheUtils.invalidateUserCache(otpData.userId);

    passwordResetOtpStore.delete(email);

    try {
      const confirmationEmailTemplate = {
        subject: "Password Reset Successfully",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Transacto</h1>
            </div>
            
            <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">Password Reset Successful</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Dear ${user.firstName || user.name || "User"},
              </p>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Your account password has been successfully reset. You can now log in with your new password.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${"https://transacto.onrender.com"}/login" 
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
              
              <div style="background: #f8d7da; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc3545;">
                <p style="color: #721c24; margin: 0; font-size: 14px;">
                  <strong>Security Alert:</strong> If you didn't make this change, please contact our support team immediately.
                </p>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                Best regards,<br>
                The Transacto Team
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>© 2025 Transacto. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: confirmationEmailTemplate.subject,
        html: confirmationEmailTemplate.html,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
    }

    res.send({
      success: true,
      message: "Password reset successfully",
      data: {
        email: email,
        updated: true,
      },
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).send({
      success: false,
      message: "Failed to reset password. Please try again.",
    });
  }
});

//resend OTP for password reset
router.post("/resend-password-reset-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "No account found with this email address",
      });
    }

    if (user.authProvider === "google") {
      return res.status(400).send({
        success: false,
        message: "Please use Google to sign in to your account",
        code: "OAUTH_USER",
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    passwordResetOtpStore.set(email, {
      otp,
      expiry: otpExpiry,
      userId: user._id,
      attempts: 0,
    });

    const emailTemplate = getPasswordResetOTPEmailTemplate(
      user.firstName || user.name || "User",
      otp
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    };

    await transporter.sendMail(mailOptions);

    res.send({
      success: true,
      message: "New password reset OTP sent successfully to your email",
      data: {
        email: email,
        expiresIn: "15 minutes",
      },
    });
  } catch (error) {
    console.error("Resend password reset OTP error:", error);
    res.status(500).send({
      success: false,
      message: "Failed to resend OTP. Please try again.",
    });
  }
});

module.exports = router;
