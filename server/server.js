const express = require("express");
const cors = require("cors");
require("dotenv").config();
const QRCode = require("qrcode");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/userModel"); // Import your User model
const jwt = require("jsonwebtoken");

const app = express();

// Middlewares
app.use(
  cors({
    origin: "https://transacto.onrender.com",
    // origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        "https://transacto-backend.onrender.com/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // User exists, return user
          return done(null, user);
        } else {
          // Create new user
          const newUser = new User({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            // You might want to generate a random password or handle this differently
            password: "google-oauth", // This should be handled securely
            isVerified: true, // Auto-verify Google users
            profilePicture: profile.photos[0]?.value,
            googleId: profile.id,
          });

          user = await newUser.save();
          return done(null, user);
        }
      } catch (error) {
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
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
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
    failureRedirect: "https://transacto.onrender.com/login?error=oauth_failed",
  }),
  async (req, res) => {
    try {
      // Generate JWT token for the authenticated user
      const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      // Redirect to frontend with token
      res.redirect(
        `https://transacto.onrender.com/dashboard?token=${token}&success=true`
      );
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect(
        "https://transacto.onrender.com/login?error=token_generation_failed"
      );
    }
  }
);

// Logout route
app.get("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    req.session.destroy((err) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Session destruction failed" });
      }
      res.json({ success: true, message: "Logged out successfully" });
    });
  });
});

// Routes
const dbconfig = require("./config/dbconfig");
const usersRoute = require("./routes/usersRoute");
const transactionsRoute = require("./routes/transactionsRoute");
const requestRoute = require("./routes/requestRoute");

app.use("/api/users", usersRoute);
app.use("/api/transactions", transactionsRoute);
app.use("/api/requests", requestRoute);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
