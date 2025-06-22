const express = require("express");
const cors = require("cors");
require("dotenv").config();
const QRCode = require("qrcode");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/userModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// CORS configuration
const frontendUrl = process.env.FRONTEND_URL;

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Session configuration
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Only use secure cookies in production
      httpOnly: true, // Prevent XSS attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "lax", // CSRF protection
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Environment validation with fallbacks for development
const requiredEnvVars = ["GOOGLE_CLIENT_SECRET", "JWT_SECRET"];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

// Generate SESSION_SECRET if not provided (with warning)
if (!process.env.SESSION_SECRET) {
  if (process.env.NODE_ENV === "production") {
    console.error("Missing required environment variable: SESSION_SECRET");
    process.exit(1);
  } else {
    console.warn(
      "⚠️  SESSION_SECRET not set. Using generated secret for development."
    );
    console.warn("⚠️  Add SESSION_SECRET to your .env file for production!");
  }
}

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? "https://transacto.onrender.com/auth/google/callback"
          : "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Validate profile data
        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
          return done(new Error("No email provided by Google"), null);
        }

        const email = profile.emails[0].value;

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
          // Update existing user's Google ID if not set
          if (!user.googleId) {
            user.googleId = profile.id;
            user.profilePicture =
              profile.photos[0]?.value || user.profilePicture;
            await user.save();
          }
          return done(null, user);
        } else {
          // Create new user with secure defaults
          const newUser = new User({
            firstName: profile.name.givenName || "User",
            lastName: profile.name.familyName || "",
            email: email,
            password: crypto.randomBytes(32).toString("hex"), // Generate secure random password
            isVerified: true, // Auto-verify Google users
            profilePicture: profile.photos[0]?.value,
            googleId: profile.id,
            authProvider: "google",
          });

          user = await newUser.save();
          return done(null, user);
        }
      } catch (error) {
        console.error("OAuth strategy error:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select("-password"); // Don't include password
    done(null, user);
  } catch (error) {
    console.error("Deserialize user error:", error);
    done(error, null);
  }
});

// OAuth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${frontendUrl}/login?error=oauth_failed`,
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        throw new Error("No user found after authentication");
      }

      // Generate JWT token with additional claims
      const tokenPayload = {
        userId: req.user._id,
        email: req.user.email,
        isVerified: req.user.isVerified,
      };

      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: "1d",
        issuer: "transacto-app",
        audience: "transacto-users",
      });

      // Redirect to frontend with token
      res.redirect(`${frontendUrl}/login?token=${token}&success=true`);
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect(`${frontendUrl}/login?error=token_generation_failed`);
    }
  }
);

// Logout route with better error handling
app.post("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({
        success: false,
        message: "Logout failed",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({
          success: false,
          message: "Session destruction failed",
          error:
            process.env.NODE_ENV === "development" ? err.message : undefined,
        });
      }

      res.clearCookie("connect.sid"); // Clear session cookie
      res.json({ success: true, message: "Logged out successfully" });
    });
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Database and routes
const dbconfig = require("./config/dbconfig");
const usersRoute = require("./routes/usersRoute");
const transactionsRoute = require("./routes/transactionsRoute");
const requestRoute = require("./routes/requestRoute");

// API routes
app.use("/api/users", usersRoute);
app.use("/api/transactions", transactionsRoute);
app.use("/api/requests", requestRoute);

// 404 handler - catch all routes that haven't been matched
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
